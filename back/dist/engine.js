"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameEngine = void 0;
const gameEngine = () => {
    const state = {
        game: undefined
    };
    const getNewBoard = () => {
        const getBasePoint = (x, y) => {
            if (x >= 4)
                x += -1;
            if (y >= 4)
                y += -1;
            return ((Math.abs(x - 3) + Math.abs(y - 3)) * 2) + 1;
        };
        const board = [];
        for (let y = 0; y < 7; y++) {
            const line = [];
            for (let x = 0; x < 7; x++) {
                line.push({
                    id: `${x}_${y}`,
                    player1: { status: "deck", villainRefused: false, points: getBasePoint(x, y) },
                    player2: { status: "deck", villainRefused: false, points: getBasePoint(x, y) },
                    status: "deck",
                    x,
                    y,
                    basePoints: getBasePoint(x, y)
                });
            }
            board.push(line);
        }
        return board;
    };
    const getRandomFromDeck = () => {
        while (true) {
            const card = state.game.board[Math.floor(Math.random() * 7)][Math.floor(Math.random() * 7)];
            if (card.status === "deck")
                return card;
        }
    };
    const distribute = (player) => {
        for (let i = 0; i < 8; i++) {
            const card = getRandomFromDeck();
            card.status = player;
            card[player].status = player;
        }
    };
    const newGame = (player1, player2) => {
        const makeId = () => {
            return Math.floor((1 + Math.random()) * 0x100000000000000000)
                .toString(32);
        };
        state.game = {
            _id: makeId(),
            board: getNewBoard(),
            nextAction: "selectHero",
            nextActionPlayer: ["player1", "player2"][1],
            player1,
            player2,
        };
        distribute("player1");
        distribute("player2");
    };
    const loadGame = (loadedGame) => {
        state.game = loadedGame;
    };
    const getUserState = (player) => {
    };
    return {
        state,
        funcs: {
            newGame,
            loadGame,
            getUserState,
        }
    };
};
exports.gameEngine = gameEngine;
