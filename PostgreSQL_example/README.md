# **Alternative-to-firebase - Demo with PostgreSQL**

This folder contains the reference example in PostgreSQL with WebSocket.

PostgreSQL is used here, but could be replaced quite quickly by any classical SQL database.The database is configured mainly with this [documentation](https://doc.ubuntu-fr.org/postgresql), but it will not be detailed here.

In order to compensate for the immediacy that Firebase RTDB allows, a websocket server will be associated to the database to provide the immediacy as well as all the necessary transactions. This server will be managed in nodeJS, and will manage the websocket with SSL connection. In addition to managing websocket connections, node will act as an [https server](https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/) to serve the web page.

> Note: *The https server via node has been managed only for convenience, but is in no way "secure", especially with the way it serves files.*

Node will use with 2 libraries: [node-postgres](https://node-postgres.com/) and [ws](https://github.com/websockets/ws).

## **How to launch the project**

### **Requirements**

Before you can launch the node server, you must first create and modify 3 files ([nodejs/cert.pem](nodejs/cert.pem), [nodejs/key.pem](nodejs/key.pem), [nodejs/config.json](nodejs/config.json)).

If you don't know how to generate the first 2, and this is only for local use without web use, then you can follow the beginning of this [page](https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/).

For the file, you just have to create it and fill it with the necessary information to connect to the database as for the example below.

```json
{
    "host": "localhost",
    "port": 5432,
    "database": "the-database-name",
    "user": "user",
    "password": "password"
}
```

### **Launch the project**

Go to the nodejs folder and do:

```sh
node mainNode.js
```

## **PostgreSQL database**

Version : psql (PostgreSQL) 13.3

With the node server it is possible to reset the database at each launch of the node server or not depending on the value of the variable **resetDatabase**. This will execute the SQL commands in this [file](nodejs/reset_table.sql)


## **Node** 

Version : v12.21.0

Node is used here only in the context of a local environment, for an online use it would be necessary to make adaptations, especially in terms of security.

## **General information on the code**

To limit the size of the communications, there are constants (*action*, *table*, *error*, ...) at the beginning of the files [mainNode.js](nodejs/mainNode.js) and  [main.js](main.js) that have the role of a correspondence table.

### **Node: [mainNode.js](nodejs/mainNode.js)**

At the beginning of the code of [mainNode.js](nodejs/mainNode.js) 3 boolean variables allow to manage some parameters:
- *isDebugLogEnable* : display or not some logs
- *resetDatabase* : at each launch of the script, reset or not the database
- *addArtificialLag* : for each response returned by the websocket server, it is possible to add an artificial lag of 500ms (mainly to test response waiting animations for clients/browsers)

For the moment it has 2 parts:
- the initialization of all services (https server, websocket server, and database connection)
- the management of websocket communications

> Note: *This file should be re-factored to improve readability.*

### **Web page: [main.js](main.js)**

Most of this file is similar to the one for the Firebase demo, except of course the part with Firebase which is replaced by websocket communications with the server (allowing the update in real time).

> Note: *This file should be re-factored to improve readability.*
