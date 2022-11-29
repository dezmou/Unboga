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
const lobby = {};
const userIdToSocket = {};
const socketIdToUserId = {};
const updateLobby = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all(userIds.map(userId => (() => __awaiter(void 0, void 0, void 0, function* () {
        if (!userIdToSocket[userId]) {
            if (lobby[userId]) {
                delete lobby[userId];
            }
        }
        else {
            if (!lobby[userId]) {
                const user = (yield (0, bdd_1.getUser)(userId));
                lobby[userId] = {
                    elo: user.user.elo,
                    id: userId,
                    name: user.user.name,
                    status: user.inGame ? "inGame" : "online"
                };
            }
        }
    }))()));
    io.emit("lobby", JSON.stringify(lobby));
});
bdd_1.onReady.subscribe(() => {
    io.on('connection', (socket) => {
        console.log("USER CON");
        socket.emit("welcome", socket.id);
        socket.on("challenge", (p) => __awaiter(void 0, void 0, void 0, function* () {
            const param = JSON.parse(p);
            const [user, target] = yield Promise.all([
                (0, bdd_1.getUser)(param.user.id),
                (0, bdd_1.getUser)(param.id)
            ]);
            if (!user.inGame
                && !target.inGame
                && userIdToSocket[param.id]
                && userIdToSocket[param.user.id]
                && (lobby[param.id] && lobby[param.id].status === "online")
                && (lobby[param.user.id] && lobby[param.user.id].status === "online")
                && !lobby[param.id].challenge
                && !lobby[param.user.id].challenge) {
                lobby[param.id].challenge = { player1: param.user.id, player2: param.id, initiator: param.user.id };
                lobby[param.user.id].challenge = { player1: param.user.id, player2: param.id, initiator: param.user.id };
                updateLobby([param.id, param.user.id]);
            }
            else {
                socket.emit("toast", JSON.stringify({
                    color: "red",
                    msg: "Impossible to challenge user",
                    time: 4000,
                }));
            }
        }));
        socket.on("cancelChallenge", (p) => __awaiter(void 0, void 0, void 0, function* () {
            const param = JSON.parse(p);
            if (!lobby[param.user.id] || !lobby[param.user.id].challenge)
                return;
            if (lobby[param.user.id].challenge.initiator !== param.user.id) {
                const op = userIdToSocket[lobby[param.user.id].challenge.player1];
                if (op) {
                    op.emit("toast", JSON.stringify({
                        color: "blue",
                        msg: "challenge declined",
                        time: 4000,
                    }));
                }
            }
            const player1 = lobby[param.user.id].challenge.player1;
            const player2 = lobby[param.user.id].challenge.player2;
            lobby[player1].challenge = undefined;
            lobby[player2].challenge = undefined;
            updateLobby([]);
        }));
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
                        msg: "User name exist Already",
                        time: 4000,
                    }));
                    return;
                }
            }
        }));
        socket.on("disconnect", () => {
            const userId = socketIdToUserId[socket.id];
            if (userId) {
                delete socketIdToUserId[socket.id];
                delete userIdToSocket[userId];
                if (lobby[userId].challenge) {
                    const [player1, player2] = [lobby[userId].challenge.player1, lobby[userId].challenge.player2];
                    delete lobby[player1].challenge;
                    delete lobby[player2].challenge;
                }
                console.log("ROEIGJOIRJGOIPRJGOP", userId);
                updateLobby([userId]);
            }
        });
        socket.on("askState", (p) => __awaiter(void 0, void 0, void 0, function* () {
            const param = JSON.parse(p);
            if (!param.user) {
                return sendState(socket, {
                    page: "login",
                    render: ["login"]
                });
            }
            else {
                const res = yield (0, bdd_1.getUser)(param.user.id);
                if (!res || res.user.token !== param.user.token) {
                    return sendState(socket, {
                        page: "login",
                        render: ["login"]
                    });
                }
                else {
                    if (!userIdToSocket[param.user.id]) {
                        userIdToSocket[param.user.id] = socket;
                        socketIdToUserId[socket.id] = param.user.id;
                        updateLobby([param.user.id]);
                    }
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
