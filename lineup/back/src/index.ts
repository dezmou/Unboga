import express from "express"
import http from "http"
import { Server } from "socket.io"

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