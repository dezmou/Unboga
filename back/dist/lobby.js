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
exports.updateLobby = exports.challenge = exports.playBot = exports.acceptChallenge = exports.cancelChallenge = void 0;
const bdd_1 = require("./bdd");
const game_1 = require("./game");
const state_1 = require("./state");
const game_interface_1 = require("../../common/src/game.interface");
const cancelChallenge = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
    if (!state_1.lobby[param.user.id] || !state_1.lobby[param.user.id].challenge)
        return;
    if (state_1.lobby[param.user.id].challenge.initiator !== param.user.id) {
        const op = state_1.userIdToSockets[state_1.lobby[param.user.id].challenge.player1];
        if (op) {
            for (const sock of Object.values(op)) {
                sock.emit("toast", JSON.stringify({
                    color: "blue",
                    msg: "Challenge declined",
                    time: 2000,
                }));
            }
        }
    }
    const player1 = state_1.lobby[param.user.id].challenge.player1;
    const player2 = state_1.lobby[param.user.id].challenge.player2;
    state_1.lobby[player1].challenge = undefined;
    state_1.lobby[player2].challenge = undefined;
    (0, exports.updateLobby)([]);
});
exports.cancelChallenge = cancelChallenge;
const acceptChallenge = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
    if (!state_1.lobby[param.user.id] || !state_1.lobby[param.user.id].challenge)
        return;
    yield (0, game_1.newGame)(state_1.lobby[param.user.id].challenge.player1, state_1.lobby[param.user.id].challenge.player2);
    const player1 = state_1.lobby[param.user.id].challenge.player1;
    const player2 = state_1.lobby[param.user.id].challenge.player2;
    if (state_1.lobby[player1]) {
        state_1.lobby[player1].challenge = undefined;
        state_1.lobby[player1].status = "inGame";
    }
    if (state_1.lobby[player2]) {
        state_1.lobby[player2].status = "inGame";
        state_1.lobby[player2].challenge = undefined;
    }
    (0, exports.updateLobby)([]);
});
exports.acceptChallenge = acceptChallenge;
const playBot = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, game_1.newGame)(param.userId, game_interface_1.BOT_ID);
    if (state_1.lobby[param.userId]) {
        state_1.lobby[param.userId].status = "inGame";
        state_1.lobby[param.userId].challenge = undefined;
    }
    (0, exports.updateLobby)([]);
});
exports.playBot = playBot;
const challenge = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
    const [user, target] = yield Promise.all([
        (0, bdd_1.getUserState)(param.user.id),
        (0, bdd_1.getUserState)(param.id)
    ]);
    if (!user.inGame
        && !target.inGame
        && state_1.userIdToSockets[param.id]
        && state_1.userIdToSockets[param.user.id]
        && (state_1.lobby[param.id] && state_1.lobby[param.id].status === "online")
        && (state_1.lobby[param.user.id] && state_1.lobby[param.user.id].status === "online")
        && !state_1.lobby[param.id].challenge
        && !state_1.lobby[param.user.id].challenge) {
        state_1.lobby[param.id].challenge = { player1: param.user.id, player2: param.id, initiator: param.user.id };
        state_1.lobby[param.user.id].challenge = { player1: param.user.id, player2: param.id, initiator: param.user.id };
        (0, exports.updateLobby)([param.id, param.user.id]);
    }
    else {
        socket.emit("toast", JSON.stringify({
            color: "red",
            msg: "Impossible to challenge user",
            time: 4000,
        }));
    }
});
exports.challenge = challenge;
const updateLobby = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all(userIds.map(userId => (() => __awaiter(void 0, void 0, void 0, function* () {
        if (!state_1.userIdToSockets[userId]) {
            if (state_1.lobby[userId]) {
                delete state_1.lobby[userId];
            }
        }
        else {
            const user = (yield (0, bdd_1.getUserState)(userId));
            if (!state_1.lobby[userId]) {
                state_1.lobby[userId] = {
                    elo: user.user.elo,
                    id: userId,
                    name: user.user.name,
                    status: user.inGame ? "inGame" : "online"
                };
            }
            else {
                state_1.lobby[userId].status = user.inGame ? "inGame" : "online";
                state_1.lobby[userId].elo = user.user.elo;
            }
        }
    }))()));
    state_1.io.emit("lobby", JSON.stringify(state_1.lobby));
});
exports.updateLobby = updateLobby;
