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
exports.newGame = void 0;
const bdd_1 = require("./bdd");
const engine_1 = require("./engine");
const newGame = (player1, player2) => __awaiter(void 0, void 0, void 0, function* () {
    const players = yield Promise.all([
        (0, bdd_1.getUser)(player1),
        (0, bdd_1.getUser)(player2),
    ]);
    const game = (0, engine_1.gameEngine)();
    game.funcs.newGame(player1, player2);
    yield (0, bdd_1.addGame)(game.state.game);
    // for (let player of players) {
    //     ; (async () => {
    //         player!.page = "game"
    //     })()
    // }
});
exports.newGame = newGame;
