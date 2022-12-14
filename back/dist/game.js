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
exports.newGame = exports.play = void 0;
const bson_1 = require("bson");
const bdd_1 = require("./bdd");
const engine_1 = require("./engine");
const lobby_1 = require("./lobby");
const state_1 = require("./state");
const users_1 = require("./users");
const powers_1 = require("../../common/src/powers");
const game_interface_1 = require("../../common/src/game.interface");
const calculateElo = (myRating, opponentRating, myGameResult) => {
    const getRatingDelta = (myRating, opponentRating, myGameResult) => {
        var myChanceToWin = 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));
        return Math.round(32 * (myGameResult - myChanceToWin));
    };
    return myRating + getRatingDelta(myRating, opponentRating, myGameResult);
};
const botPlay = (gameState) => __awaiter(void 0, void 0, void 0, function* () {
    const game = gameState.state.game;
    const func = gameState.funcs;
    // await new Promise(r => setTimeout(r, Math.floor(Math.random() * 500)))
    if (game.nextAction === "pick") {
        const fork = (0, engine_1.gameEngine)();
        fork.funcs.loadGame(JSON.parse(JSON.stringify(game)));
        fork.funcs.pickGreen(game_interface_1.BOT_ID);
        const cards = func.getAllCard();
        const forkCards = fork.funcs.getAllCard();
        if (forkCards.filter(c => c.player2.inStreak).length > cards.filter(c => c.player2.inStreak).length) {
            func.pickGreen(game_interface_1.BOT_ID);
        }
        else {
            func.pickRandom(game_interface_1.BOT_ID);
        }
    }
    else if (game.nextAction === "discard") {
        const card = (() => {
            return (func.getAllCard()
                .filter(c => !c.player2.inStreak && c.status === "player2")
                .sort((a, b) => b.player2.points - a.player2.points))[0];
        })();
        func.discard(game_interface_1.BOT_ID, card.x, card.y);
    }
    else if (game.nextAction === "choose") {
        const choices = func.getAllCard().filter(c => c.player2.status === "deck");
        const choice = choices[Math.floor(Math.random() * choices.length)];
        func.choose("player2", choice.x, choice.y);
    }
    return true;
});
const play = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (yield (0, bdd_1.getUserState)(param.userId));
    const gameState = (yield (0, bdd_1.getGame)(user.game.id));
    const game = (0, engine_1.gameEngine)();
    game.funcs.loadGame(gameState);
    if (param.play === "pickPower") {
        const p = param;
        if (game.state.game.player1.powerReady || game.state.game.player2.powerReady || game.state.game.player2Id === game_interface_1.BOT_ID) {
            for (const playerId of [game.state.game.player1Id, game.state.game.player2Id]) {
                (0, state_1.addConsume)(playerId, { audios: ["choose"] });
            }
        }
        game.funcs.pickPower(p.userId, p.powers);
    }
    else if (param.play === "pickGreen") {
        const p = param;
        game.funcs.pickGreen(p.userId);
        for (const playerId of [game.state.game.player1Id, game.state.game.player2Id]) {
            (0, state_1.addConsume)(playerId, { audios: ["pomp"] });
        }
    }
    else if (param.play === "choose") {
        const p = param;
        game.funcs.choose(p.userId, p.x, p.y);
    }
    else if (param.play === "pickRandom") {
        const p = param;
        game.funcs.pickRandom(p.userId);
        for (const playerId of [game.state.game.player1Id, game.state.game.player2Id]) {
            (0, state_1.addConsume)(playerId, { audios: ["pomp"] });
        }
    }
    else if (param.play === "discard") {
        const p = param;
        game.funcs.discard(p.userId, p.x, p.y);
        (0, state_1.addConsume)(p.userId, { audios: ["pomp"] });
        (0, state_1.addConsume)(game.funcs.getOpId(p.userId), { audios: ["you"] });
    }
    else if (param.play === "knock") {
        const p = param;
        game.funcs.knock(p.userId);
    }
    else if (param.play === "ready") {
        const p = param;
        game.funcs.setReady(p.userId);
    }
    else if (param.play === "capitulate") {
        const p = param;
        for (const playerId of [game.state.game.player1Id, game.state.game.player2Id]) {
            (0, state_1.addConsume)(playerId, { audios: ["close"] });
        }
        game.funcs.capitulate(p.userId);
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
    const checkRoundResult = () => {
        if (game.state.game.roundResult
            && !game.state.game.player1.ready
            && !game.state.game.gameResult
            && (game.state.game.player2Id === game_interface_1.BOT_ID ? true : !game.state.game.player2.ready)) {
            if (game.state.game.roundResult.reason === "knock_win") {
                (0, state_1.addConsume)(param.userId, { audios: ["knock"] });
                (0, state_1.addConsume)(game.funcs.getOpId(param.userId), { audios: ["knock"] });
            }
            if (game.state.game.roundResult.reason === "knock_lost") {
                (0, state_1.addConsume)(param.userId, { audios: ["fool"] });
                (0, state_1.addConsume)(game.funcs.getOpId(param.userId), { audios: ["fool"] });
            }
            if (game.state.game.roundResult.reason === "knock_full") {
                (0, state_1.addConsume)(param.userId, { audios: ["full"] });
                (0, state_1.addConsume)(game.funcs.getOpId(param.userId), { audios: ["full"] });
            }
        }
    };
    if (game.state.game.player2Id !== game_interface_1.BOT_ID) {
        const op = ((yield (0, bdd_1.getUserState)(gameState.player1Id === param.userId ? gameState.player2Id : gameState.player1Id)));
        let lobbyNeedUpdate = false;
        if (game.state.game.gameResult && !(game.state.game.gameResult && game.state.game.gameResult.reason === "capitulate")) {
            if (!game.state.game.misc.endGameProcessed) {
                const res = game.state.game.gameResult;
                const player1 = game.state.game.player1Id === user.user.id ? user : op;
                const player2 = game.state.game.player1Id === user.user.id ? op : user;
                if (res.winner === "player1") {
                    player1.user.elo = calculateElo(player1.user.elo, player2.user.elo, 1);
                    player2.user.elo = calculateElo(player2.user.elo, player1.user.elo, 0);
                }
                else if (res.winner === "player2") {
                    player1.user.elo = calculateElo(player1.user.elo, player2.user.elo, 0);
                    player2.user.elo = calculateElo(player2.user.elo, player1.user.elo, 1);
                }
                else if (res.winner === "draw") {
                    player1.user.elo = calculateElo(player1.user.elo, player2.user.elo, 0.5);
                    player2.user.elo = calculateElo(player2.user.elo, player1.user.elo, 0.5);
                }
                game.state.game.misc.player1.elo = player1.user.elo;
                game.state.game.misc.player2.elo = player2.user.elo;
                game.state.game.misc.endGameProcessed = true;
                lobbyNeedUpdate = true;
            }
        }
        checkRoundResult();
        yield Promise.all([
            (0, bdd_1.updateGame)(game.state.game),
            ...[user, op].map((pState) => __awaiter(void 0, void 0, void 0, function* () { return updateUserGame(pState); }))
        ]);
        if (lobbyNeedUpdate) {
            (0, lobby_1.updateLobby)([user.user.id, op.user.id]);
        }
    }
    else {
        if (!game.state.game.player2.ready) {
            game.funcs.setReady(game_interface_1.BOT_ID);
        }
        if (!game.state.game.player2.powerReady) {
            const pows = Object.keys(powers_1.powers).filter((e) => {
                if (e === "unknow") {
                    return false;
                }
                if (game.state.game.player2.powers.filter(b => b === e).length >= (powers_1.powers[e]).max) {
                    return false;
                }
                return true;
            });
            console.log(pows);
            game.funcs.pickPower(game_interface_1.BOT_ID, pows[Math.floor(Math.random() * pows.length)]);
        }
        if (game.state.game.gameResult) {
            game.state.game.gameResult.revenge.player2 = "yes";
        }
        checkRoundResult();
        yield Promise.all([updateUserGame(user), (0, bdd_1.updateGame)(game.state.game)]);
        while (game.state.game.nextActionPlayer === "player2"
            && game.state.game.player1.ready
            && game.state.game.player1.powerReady
            && !game.state.game.gameResult) {
            yield botPlay(game);
            checkRoundResult();
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
    game.state.game.misc.player1 = { elo: p1State.user.elo, name: p1State.user.name, roundWon: 0 };
    game.state.game.misc.player2 = { elo: p2State.user.elo, name: p2State.user.name, roundWon: 0 };
    yield Promise.all([
        (0, bdd_1.addGame)(game.state.game),
        ...(player2 !== game_interface_1.BOT_ID ? [p1State, p2State] : [p1State]).map((pState) => __awaiter(void 0, void 0, void 0, function* () {
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
