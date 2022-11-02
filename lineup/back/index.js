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
    path: '/api'
});
setInterval(() => {
    io.emit('chien', { someProperty: 'some value', otherProperty: 'other value' });
}, 1000);
app.use(cors({
    origin: (origin, callback) => {
        callback(null, true);
    },
    credentials: true,
}));
io.on('connection', (socket) => {
    console.log('a user connected');
});
app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});
server.listen(3001, () => {
    console.log("SERVER STARTED");
});
