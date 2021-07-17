const https = require('https');
const fs = require('fs');
const { Client } = require('pg'); // https://node-postgres.com/
const WebSocket = require('ws');  // https://github.com/websockets/ws

const dataConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const isDebugLogEnable = true;
const resetDatabase = true;

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
        // .then(res => console.log(res))
        .catch(e => console.error(e.stack));
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

// action = get, set, update, remove, listenEvent
// dataAction = issue, member

const wss = new WebSocket.Server({ server: httpsServer });

wss.on('connection', function connection(ws) {
    if (isDebugLogEnable) {
        console.log("One new WebSocket connected");
    }
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('message', function incoming(message) {
        console.log('Received: %s', message); // After the tests are conclusive, display this only on isDebugLogEnable value
        ws.send('Hello from server');
    });
    ws.on('close', function close() {
        if (isDebugLogEnable) {
            console.log("One WebSocket close");
        }
    });
    client.query('SELECT * FROM issue')
        .then(res => ws.send(JSON.stringify(res.rows)))
        .catch(e => { ws.send("error"); console.error(e.stack) });

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