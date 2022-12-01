"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameEngine = void 0;
const game_interface_1 = require("./common/game.interface");
const makeId = () => {
    return Math.floor((1 + Math.random()) * 0x1000000000000000)
        .toString(32);
};
const gameEngine = () => {
    const state = {
        game: undefined
    };
    const op = {
        player1: "player2",
        player2: "player1",
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
        for (let y = 0; y < game_interface_1.BOARD_SIZE; y++) {
            const line = [];
            for (let x = 0; x < game_interface_1.BOARD_SIZE; x++) {
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
            const card = state.game.board[Math.floor(Math.random() * game_interface_1.BOARD_SIZE)][Math.floor(Math.random() * game_interface_1.BOARD_SIZE)];
            if (card.status === "deck")
                return card;
        }
    };
    const distribute = (player) => {
        for (let i = 0; i < game_interface_1.INITIAL_CARD_AMOUNT; i++) {
            const card = getRandomFromDeck();
            card.status = player;
            card[player].status = player;
        }
    };
    const newGame = (id, player1, player2) => {
        state.game = {
            id,
            roundId: makeId(),
            pick: { x: 0, y: 0 },
            board: getNewBoard(),
            nextAction: "selectHero",
            nextActionPlayer: ["player1", "player2"][1],
            player1Id: player1,
            player2Id: player2,
            player1: { gold: 100, powers: [], powerReady: false },
            player2: { gold: 100, powers: [], powerReady: false },
        };
        distribute("player1");
        distribute("player2");
        const pick = getRandomFromDeck();
        state.game.pick = { x: pick.x, y: pick.y };
    };
    const loadGame = (loadedGame) => {
        state.game = loadedGame;
    };
    const getPlayerById = (playerId) => {
        return state.game.player1Id === playerId ? "player1" : "player2";
    };
    const selectPowers = (playerId, selectedPowers) => {
        const player = getPlayerById(playerId);
        state.game[player].powers = selectedPowers;
        state.game[player].powerReady = true;
        if (state.game[op[player]].powerReady) {
            state.game.nextAction = "pick";
        }
    };
    const getUserGame = (playerId) => {
        const you = state.game.player1Id === playerId ? "player1" : "player2";
        const villain = state.game.player1Id === playerId ? "player2" : "player1";
        const userGame = Object.assign(Object.assign({}, state.game), { you,
            villain, board: state.game.board.map(line => line.map(card => (Object.assign(Object.assign({}, card), { player1: undefined, player2: undefined, status: card[you], points: card.basePoints })))) });
        return userGame;
    };
    return {
        state,
        funcs: {
            newGame,
            loadGame,
            getUserGame,
            selectPowers,
        }
    };
};
exports.gameEngine = gameEngine;
