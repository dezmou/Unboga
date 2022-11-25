import express from "express"
import http from "http"
import { Server } from "socket.io"
import { MongoClient } from "mongodb"

const cors = require("cors")
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    // cors : {
    //     origin : "*",
    // }
    path: '/api',
});

io.on('connection', (socket) => {
    console.log("USER CON");
    socket.emit("welcome", socket.id)
});

server.listen({
    port: 3001,
    host: "0.0.0.0",
}, () => {
    console.log("SERVER STARTED");
});

; (async () => {
    const client = new MongoClient(`mongodb://root:chien@mongo:27017`);
    await client.connect();
    const db = client.db("unbogame");
    await db.createCollection("users", {}).catch(e => { });
    await client.close();
    console.log("SUCESS");
})()