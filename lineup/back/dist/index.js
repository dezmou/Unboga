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
const bdd_1 = require("./bdd");
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
const tokenSocket = {};
bdd_1.onReady.subscribe(() => {
    io.on('connection', (socket) => {
        console.log("USER CON");
        socket.emit("welcome", socket.id);
        socket.on("login", (p) => __awaiter(void 0, void 0, void 0, function* () {
            const param = JSON.parse(p);
            const res = yield (0, bdd_1.getUserByName)(param.name);
            if (!res || param.password !== res.password) {
                socket.emit("toast", JSON.stringify({
                    color: "red",
                    msg: "Wrong username or password",
                    time: 4000,
                }));
                return;
            }
            socket.emit("connected", JSON.stringify({ id: res._id, token: res.token }));
        }));
        socket.on("createUser", (p) => __awaiter(void 0, void 0, void 0, function* () {
            const param = JSON.parse(p);
            try {
                const user = yield (0, bdd_1.addUser)(param.name, param.password);
                socket.emit("connected", JSON.stringify({ id: user.id, token: user.token }));
            }
            catch (e) {
                if (e === "USER_EXIST") {
                    socket.emit("toast", JSON.stringify({
                        color: "red",
                        msg: "User name Exist Already",
                        time: 4000,
                    }));
                    return;
                }
            }
        }));
        socket.on("askState", (p) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const param = JSON.parse(p);
            if (!param.user) {
                return sendState(socket, {
                    page: "login",
                    render: ["login"]
                });
            }
            else {
                const res = yield (0, bdd_1.getUser)(param.user.id);
                if (!res || ((_a = res.user) === null || _a === void 0 ? void 0 : _a.token) !== param.user.token) {
                    return sendState(socket, {
                        page: "login",
                        render: ["login"]
                    });
                }
                else {
                    return sendState(socket, res);
                }
            }
        }));
    });
    server.listen({
        port: 3001,
        host: "0.0.0.0",
    }, () => {
        console.log("SERVER STARTED");
    });
});
