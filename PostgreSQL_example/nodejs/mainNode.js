const https = require('https');
const fs = require('fs');
const { Client } = require('pg'); // https://node-postgres.com/
const WebSocket = require('ws');  // https://github.com/websockets/ws

const dataConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const isDebugLogEnable = true;
const resetDatabase = true;

const issueNameRow = {
    id: 0,
    name: 1,
    desc: 2,
    member: 3,
    all: 4
};
const memberNameRow = {
    id: 0,
    name: 1,
    all: 2
};
const action = {
    init: 0,
    addToDB: 1,
    modifyToDB: 2,
    removeToDB: 3,
    DB_new: 4,
    DB_modify: 5,
    DB_remove: 6
};
const table = {
    member: 0,
    issue: 1
};
const error = {
    deleteMemberAssigned: 0
}

const client = new Client({
    host: dataConfig.host,
    port: dataConfig.port,
    database: dataConfig.database,
    user: dataConfig.user,
    password: dataConfig.password,
});

client.connect()
    .then(() => console.log('Connected to database'))
    .catch(err => console.error('Connection error to database', err.stack));

if (resetDatabase) {
    const sqlResetQuery = fs.readFileSync('reset_table.sql', 'utf8');
    client.query(sqlResetQuery)
        .then(res => console.log("Database reset"))
        .catch(e => console.error(e.stack));
} else {
    console.log("Database not reset")
}

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const relativePathFileWeb = "..";

const httpsServer = https.createServer(options, function (req, res) {
    res.writeHead(200);
    let fileName;
    switch (req.url) {
        case "/main.js":
            fileName = req.url;
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            break;
        default:
            fileName = "/index.html";
            res.writeHead(200, { 'Content-Type': 'text/html' });
            break;
    }
    fs.readFile(relativePathFileWeb + fileName, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.end(`Error while loading ${fileName}\n`);
            return;
        }
        res.end(data);
    })
}).listen(8000);
console.log('Https server launched');

/* ----------------------- Part for WebSocket ----------------------- */
// Todo, separe fonctionnality (httpsServer and Websocket server) in several file/function

const wss = new WebSocket.Server({ server: httpsServer });

wss.on('connection', function connection(ws) {
    if (isDebugLogEnable) {
        console.log("One new WebSocket connected");
    }
    ws.isAlive = true;
    ws.id = "" + Date.now() + "-" + Math.random(); // Need to be better for an real use (use UUID for exemple)
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('message', function incoming(message) {
        console.log('Received: %s', message); // After the tests are conclusive, display this only on isDebugLogEnable value

        switch (parseInt(message.charAt(0), 10)) {
            case action.modifyToDB:
                modifyToDB(ws, parseInt(message.charAt(1), 10), message.charAt(2), JSON.parse(message.substring(3)), () => {
                    wss.clients.forEach(wsToNotify => {
                        if (wsToNotify.id !== ws.id) {
                            wsToNotify.send(action.DB_modify + message.substring(1));
                        }
                    });
                });
                break;
            case action.addToDB:
                console.log("test");
                addToDB(ws, parseInt(message.charAt(1), 10), (newId) => {
                    wss.clients.forEach(wsToNotify => {
                        wsToNotify.send(action.DB_new + message.charAt(1) + newId);
                    });
                });
                break;
            case action.removeToDB:
                removeToDB(ws, parseInt(message.charAt(1), 10), parseInt(message.substring(2), 10), (id) => {
                    wss.clients.forEach(wsToNotify => {
                        wsToNotify.send(action.DB_remove + message.charAt(1) + id);
                    });
                });

                break;
            default:
                break;
        }
    });
    ws.on('close', function close() {
        if (isDebugLogEnable) {
            console.log("One WebSocket close");
        }
    });
    let initData = [undefined, undefined];

    client.query('SELECT * FROM member ORDER BY member_id;')
        .then(res => {
            for (let i = 0; i < res.rows.length; i++) {
                res.rows[i] = [res.rows[i]['member_id'], res.rows[i]['member_name']];
            }
            initData[table.member] = res.rows;
            client.query('SELECT * FROM issue ORDER BY issue_id;')
                .then(res => {
                    for (let i = 0; i < res.rows.length; i++) {
                        res.rows[i] = [res.rows[i]['issue_id'], res.rows[i]['issue_name'], res.rows[i]['issue_description'], res.rows[i]['member_id']];
                    }
                    initData[table.issue] = res.rows;
                    ws.send(action.init + JSON.stringify(initData));
                })
                .catch(e => {
                    ws.send("error");
                    console.error(e.stack)
                });
        })
        .catch(e => {
            ws.send("error");
            console.error(e.stack)
        });


});

console.log('WebSocket server launched');

setInterval(() => {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            if (isDebugLogEnable) {
                console.log("WebSocket not active, it will be terminated");
            }
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
    });
}, 3000);

function modifyToDB(ws, tableId, rowIdToModify, data, callback) {
    let values;
    let query;
    switch (tableId) {
        case table.member:
            values = [data[0], data[1]];
            query = `UPDATE member SET member_name = $2 WHERE member_id = $1;`
            client
                .query(query, values)
                .then(res => {
                    // sent ok to client
                    callback();
                })
                .catch(e => console.error(e.stack));
            break;
        case table.issue:
            /* 
                No modification of the issue_id is possible, then no issue_id in rowNameDB.
                We need to manage the case issueNameRow.all, for now just ignore it
            */
            const rowNameDB = ["issue_name", "issue_description", "member_id"];
            const rowName = rowNameDB[rowIdToModify - 1];
            values = [data[0], data[1]];

            query = `UPDATE issue SET ${rowName} = $2 WHERE issue_id = $1;`

            client
                .query(query, values)
                .then(res => {
                    // sent ok to client
                    callback();
                })
                .catch(e => console.error(e.stack));
            break;
        default:
            ws.send("error");
            break;
    }
}

function addToDB(ws, tableId, callback) {
    switch (tableId) {
        case table.member:
            client
                .query("INSERT INTO member (member_name) VALUES ('') RETURNING member_id;")
                .then(res => {
                    callback(res.rows[0]['member_id']);
                })
                .catch(e => {
                    console.error(e.stack);
                    ws.send("error");
                })
            break;
        case table.issue:
            client
                .query("INSERT INTO issue (issue_name) VALUES ('') RETURNING issue_id;")
                .then(res => {
                    callback(res.rows[0]['issue_id']);
                })
                .catch(e => {
                    console.error(e.stack);
                    ws.send("error");
                })
            break;
        default:
            ws.send("error");
            break;
    }
}

function removeToDB(ws, tableId, id, callback) {
    switch (tableId) {
        case table.member:
            client
                .query(`SELECT COUNT(member_id) FROM issue WHERE member_id = $1;`, [id])
                .then((res) => {
                    if (res.rows[0].count == 0) {
                        client
                            .query(`DELETE FROM member WHERE member_id = $1;`, [id])
                            .then(() => {
                                callback(id);
                            })
                            .catch(e => {
                                console.error(e.stack);
                                ws.send("error" + error.deleteMemberAssigned + id);
                            });
                    } else {
                        // TODO
                    }
                })
                .catch(e => {
                    console.error(e.stack);
                    ws.send("error");
                });

            break;
        case table.issue:
            client
                .query(`DELETE FROM issue WHERE issue_id = $1;`, [id])
                .then(() => {
                    callback(id);
                })
                .catch(e => {
                    console.error(e.stack);
                    ws.send("error");
                });
            break;
        default:
            ws.send("error");
            break;
    }
}