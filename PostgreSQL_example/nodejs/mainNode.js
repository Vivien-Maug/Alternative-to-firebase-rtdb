const https = require('https');
const fs = require('fs');
const { Client } = require('pg'); // https://node-postgres.com/
const WebSocket = require('ws');  // https://github.com/websockets/ws

const dataConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));

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

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const relativePathFileWeb = "..";

https.createServer(options, function (req, res) {
    res.writeHead(200);
    let fileName;
    switch (req.url) {
        case "/main.js":
            fileName = req.url;
            break;
        default:
            fileName = "/index.html"
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
// Todo, separe fonctionnality (httpsServer and Websocket server) in two file

const server = https.createServer({
    cert: options.cert,
    key: options.key
});
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('something');
});

server.listen(8080);
console.log('WebSocket server launched');