"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const cors = require("cors");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    // cors : {
    //     origin : "*",
    // }
    path: '/api'
});
const db = new better_sqlite3_1.default('base.db', {});
// app.use(cors({
//     origin: (origin: any, callback: any) => {
//         callback(null, true)
//     },
//     credentials: true,
// }))
io.on('connection', (socket) => {
    console.log("USER CON");
    socket.emit("welcome", socket.id);
});
// app.get('/', (req, res) => {
//     res.send('<h1>Hello world</h1>');
// });
server.listen(3001, () => {
    console.log("SERVER STARTED");
});
