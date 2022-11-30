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
exports.newGame = exports.capitulate = void 0;
const bson_1 = require("bson");
const bdd_1 = require("./bdd");
const engine_1 = require("./engine");
const users_1 = require("./users");
const capitulate = (socket, param) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("CAPITULATE", param);
    const game = yield (0, bdd_1.getGame)(param.gameId);
    yield Promise.all([game.player1Id, game.player2Id].map((playerId) => __awaiter(void 0, void 0, void 0, function* () {
        const state = (yield (0, bdd_1.getUserState)(playerId));
        state.game = undefined;
        state.inGame = undefined;
        state.page = "lobby";
        yield (0, bdd_1.updateUserState)(playerId, state);
        (0, users_1.sendStateToUser)(playerId, state);
    })));
});
exports.capitulate = capitulate;
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
        ...[p1State, p2State].map((pState) => __awaiter(void 0, void 0, void 0, function* () {
            pState.inGame = game.state.game.id;
            const userGame = game.funcs.getUserGame(pState.user.id);
            pState.game = userGame;
            pState.page = "game";
            p1State.render = ["global"];
            yield (0, bdd_1.updateUserState)(pState.user.id, pState);
            (0, users_1.sendStateToUser)(pState.user.id, pState);
        }))
    ]);
    // for (let player of players) {
    //     ; (async () => {
    //         player!.page = "game"
    //     })()
    // }
});
exports.newGame = newGame;
