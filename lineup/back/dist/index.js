"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors = require("cors");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    // cors : {
    //     origin : "*",
    // }
    path: '/api',
});
const sendState = (socket, state) => {
    socket.emit("newState", JSON.stringify(state));
};
io.on('connection', (socket) => {
    console.log("USER CON");
    socket.emit("welcome", socket.id);
    socket.on("askState", (param) => {
        console.log("User ask for state", param.user);
        if (!param.user) {
            return sendState(socket, { connected: false });
        }
    });
});
server.listen({
    port: 3001,
    host: "0.0.0.0",
}, () => {
    console.log("SERVER STARTED");
});
// ; (async () => {
//     const client = new MongoClient(`mongodb://root:chien@mongo:27017`);
//     await client.connect();
//     const db = client.db("unbogame");
//     await db.createCollection("users", {}).catch(e => { });
//     await client.close();
//     console.log("SUCESS");
// })()
