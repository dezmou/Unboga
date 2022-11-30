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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.askState = exports.login = exports.disconnect = void 0;
const bdd_1 = require("./bdd");
const lobby_1 = require("./lobby");
const state_1 = require("./state");
const disconnect = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("DISCONNECT");
    const userId = state_1.socketIdToUserId[socket.id];
    if (userId) {
        delete state_1.socketIdToUserId[socket.id];
        delete state_1.userIdToSocket[userId];
        if (state_1.lobby[userId].challenge) {
            const [player1, player2] = [state_1.lobby[userId].challenge.player1, state_1.lobby[userId].challenge.player2];
            delete state_1.lobby[player1].challenge;
            delete state_1.lobby[player2].challenge;
        }
        (0, lobby_1.updateLobby)([userId]);
    }
});
exports.disconnect = disconnect;
const login = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.login = login;
const askState = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
    if (!param.user) {
        return (0, state_1.sendState)(socket, {
            page: "login",
            render: ["login"]
        });
    }
    else {
        const res = yield (0, bdd_1.getUserState)(param.user.id);
        if (!res || res.user.token !== param.user.token) {
            return (0, state_1.sendState)(socket, {
                page: "login",
                render: ["login"]
            });
        }
        else {
            if (!state_1.userIdToSocket[param.user.id]) {
                state_1.userIdToSocket[param.user.id] = socket;
                state_1.socketIdToUserId[socket.id] = param.user.id;
                (0, lobby_1.updateLobby)([param.user.id]);
            }
            return (0, state_1.sendState)(socket, res);
        }
    }
});
exports.askState = askState;
const createUser = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.createUser = createUser;
