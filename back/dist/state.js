"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addConsume = exports.consumeList = exports.socketIdToUserId = exports.userIdToSockets = exports.lobby = exports.io = exports.sendState = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const game_interface_1 = require("../../common/src/game.interface");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
server.listen({ port: 3001, host: "0.0.0.0", }, () => {
    console.log("SERVER STARTED");
});
const sendState = (socket, state) => {
    socket.emit("newState", JSON.stringify(state));
};
exports.sendState = sendState;
exports.io = new socket_io_1.Server(server, { path: '/api' });
exports.lobby = {};
exports.userIdToSockets = {};
exports.socketIdToUserId = {};
exports.consumeList = {};
const addConsume = (userId, con) => {
    if (userId === game_interface_1.BOT_ID)
        return;
    if (!exports.consumeList[userId]) {
        exports.consumeList[userId] = con;
    }
    else {
        exports.consumeList[userId] = {
            audios: [...(exports.consumeList[userId]).audios, ...con.audios]
        };
    }
};
exports.addConsume = addConsume;
