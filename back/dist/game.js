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
exports.newGame = exports.play = exports.capitulate = exports.BOT_ID = void 0;
const bson_1 = require("bson");
const bdd_1 = require("./bdd");
const engine_1 = require("./engine");
const lobby_1 = require("./lobby");
const users_1 = require("./users");
exports.BOT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const capitulate = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
    const game = yield (0, bdd_1.getGame)(param.gameId);
    yield Promise.all([game.player1Id, game.player2Id].map((playerId) => __awaiter(void 0, void 0, void 0, function* () {
        const state = (yield (0, bdd_1.getUserState)(playerId));
        state.game = undefined;
        state.inGame = undefined;
        state.page = "lobby";
        yield (0, bdd_1.updateUserState)(playerId, state);
        (0, users_1.sendStateToUser)(playerId, state);
    })));
    (0, lobby_1.updateLobby)([game.player1Id, game.player2Id]);
});
exports.capitulate = capitulate;
const botPlay = (gameState) => __awaiter(void 0, void 0, void 0, function* () {
    const game = gameState.state.game;
    const func = gameState.funcs;
    yield new Promise(r => setTimeout(r, Math.floor(Math.random() * 500)));
    if (game.nextAction === "pick") {
        if (Math.random() > 0.33) {
            func.pickRandom("bot");
        }
        else {
            func.pickGreen("bot");
        }
    }
    else {
        const card = (() => {
            while (true) {
                const x = Math.floor(Math.random() * 8);
                const y = Math.floor(Math.random() * 8);
                if (game.board[y][x].status === "player2") {
                    return game.board[y][x];
                }
            }
        })();
        func.discard("bot", card.x, card.y);
    }
    return true;
});
const play = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (yield (0, bdd_1.getUserState)(param.userId));
    const gameState = (yield (0, bdd_1.getGame)(user.game.id));
    const game = (0, engine_1.gameEngine)();
    game.funcs.loadGame(gameState);
    if (param.play === "selectPower") {
        const p = param;
        game.funcs.selectPowers(p.userId, p.powers);
    }
    else if (param.play === "pickGreen") {
        const p = param;
        game.funcs.pickGreen(p.userId);
    }
    else if (param.play === "pickRandom") {
        const p = param;
        game.funcs.pickRandom(p.userId);
    }
    else if (param.play === "discard") {
        const p = param;
        game.funcs.discard(p.userId, p.x, p.y);
    }
    else if (param.play === "knock") {
        const p = param;
        game.funcs.knock(p.userId);
    }
    else if (param.play === "ready") {
        const p = param;
        game.funcs.setReady(p.userId);
    }
    else if (param.play === "exitLobby") {
        user.inGame = undefined;
        user.game = undefined;
        user.page = "lobby";
        user.render = ["global"];
        game.state.game.gameResult.revenge[game.funcs.getPlayerById(param.userId)] = "no";
    }
    else if (param.play === "revenge") {
        game.state.game.gameResult.revenge[game.funcs.getPlayerById(param.userId)] = "yes";
        if (game.state.game.gameResult.revenge.player1 === "yes"
            && game.state.game.gameResult.revenge.player2 === "yes") {
            yield (0, exports.newGame)(game.state.game.player1Id, game.state.game.player2Id);
            return;
        }
    }
    const updateUserGame = (state) => __awaiter(void 0, void 0, void 0, function* () {
        if (state.inGame) {
            const userGame = game.funcs.getUserGame(state.user.id);
            state.game = userGame;
            state.render = ["game"];
        }
        yield (0, bdd_1.updateUserState)(state.user.id, state);
        if (!state.inGame) {
            (0, lobby_1.updateLobby)([state.user.id]);
        }
        (0, users_1.sendStateToUser)(state.user.id, state);
    });
    if (game.state.game.player2Id !== exports.BOT_ID) {
        const op = ((yield (0, bdd_1.getUserState)(gameState.player1Id === param.userId ? gameState.player2Id : gameState.player1Id)));
        yield Promise.all([
            (0, bdd_1.updateGame)(game.state.game),
            ...[user, op].map((pState) => __awaiter(void 0, void 0, void 0, function* () { return updateUserGame(pState); }))
        ]);
    }
    else {
        if (!game.state.game.player2.ready) {
            game.funcs.setReady(exports.BOT_ID);
        }
        if (!game.state.game.player2.powerReady) {
            game.funcs.selectPowers(exports.BOT_ID, []);
        }
        if (game.state.game.gameResult) {
            game.state.game.gameResult.revenge.player2 = "yes";
        }
        yield Promise.all([updateUserGame(user), (0, bdd_1.updateGame)(game.state.game)]);
        while (game.state.game.nextActionPlayer === "player2"
            && game.state.game.player1.ready
            && game.state.game.player1.powerReady
            && !game.state.game.gameResult) {
            yield botPlay(game);
            yield Promise.all([updateUserGame(user), (0, bdd_1.updateGame)(game.state.game)]);
        }
    }
});
exports.play = play;
const newGame = (player1, player2) => __awaiter(void 0, void 0, void 0, function* () {
    const [p1State, p2State] = yield Promise.all([
        (0, bdd_1.getUserState)(player1),
        (0, bdd_1.getUserState)(player2),
    ]);
    const game = (0, engine_1.gameEngine)();
    const id = new bson_1.ObjectID();
    game.funcs.newGame(id.toString(), player1, player2);
    yield Promise.all([
        (0, bdd_1.addGame)(game.state.game),
        ...(player2 !== exports.BOT_ID ? [p1State, p2State] : [p1State]).map((pState) => __awaiter(void 0, void 0, void 0, function* () {
            pState.inGame = game.state.game.id;
            const userGame = game.funcs.getUserGame(pState.user.id);
            pState.game = userGame;
            pState.page = "game";
            pState.render = ["global"];
            yield (0, bdd_1.updateUserState)(pState.user.id, pState);
            (0, users_1.sendStateToUser)(pState.user.id, pState);
        }))
    ]);
});
exports.newGame = newGame;
