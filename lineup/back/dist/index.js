"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const mongodb_1 = require("mongodb");
const cors = require("cors");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    // cors : {
    //     origin : "*",
    // }
    path: '/api',
});
io.on('connection', (socket) => {
    console.log("USER CON");
    socket.emit("welcome", socket.id);
});
server.listen({
    port: 3001,
    host: "0.0.0.0",
}, () => {
    console.log("SERVER STARTED");
});
;
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("TRYING TO CONNECT MONGO");
    const client = new mongodb_1.MongoClient(`mongodb://root:chien@mongo:27017`);
    yield client.connect();
    const db = client.db("unbogame");
    yield db.createCollection("users", {}).catch(e => { });
    yield client.close();
    console.log("SUCESS");
}))();
