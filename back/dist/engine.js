"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameEngine = void 0;
const game_interface_1 = require("../../common/src/game.interface");
const powers_1 = require("../../common/src/powers");
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
        const initCardStatus = (x, y) => ({
            status: "deck",
            villainRefused: false,
            points: getBasePoint(x, y),
            hori: false,
            inStreak: false,
            verti: false,
        });
        for (let y = 0; y < game_interface_1.BOARD_SIZE; y++) {
            const line = [];
            for (let x = 0; x < game_interface_1.BOARD_SIZE; x++) {
                line.push({
                    id: `${x}_${y}`,
                    player1: initCardStatus(x, y),
                    player2: initCardStatus(x, y),
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
    const getCardValue = (card, player) => {
        if (state.game[player].powers.includes("mirror")) {
            return 14 - card.basePoints;
        }
        return card.basePoints;
    };
    const evaluate = (player) => {
        const horiStreak = [];
        const vertiStreak = [];
        const board = state.game.board;
        for (let y = 0; y < game_interface_1.BOARD_SIZE; y++) {
            let streak = [];
            for (let x = 0; x < game_interface_1.BOARD_SIZE; x++) {
                const card = board[y][x];
                if (card.status === player) {
                    streak.push(card);
                }
                if (card.status !== player || x + 1 === game_interface_1.BOARD_SIZE) {
                    if (streak.length >= 3) {
                        horiStreak.push(streak);
                    }
                    streak = [];
                }
            }
        }
        for (let x = 0; x < game_interface_1.BOARD_SIZE; x++) {
            let streak = [];
            for (let y = 0; y < game_interface_1.BOARD_SIZE; y++) {
                const card = board[y][x];
                if (card.status === player) {
                    streak.push(card);
                }
                if (card.status !== player || y + 1 === game_interface_1.BOARD_SIZE) {
                    if (streak.length >= 3) {
                        vertiStreak.push(streak);
                    }
                    streak = [];
                }
            }
        }
        for (let line of board) {
            for (let card of line) {
                card[player].inStreak = false;
                card[player].hori = false;
                card[player].verti = false;
            }
        }
        for (let hori of horiStreak) {
            for (let card of hori) {
                card[player].inStreak = true;
                card[player].hori = true;
            }
        }
        for (let verti of vertiStreak) {
            for (let card of verti) {
                card[player].inStreak = true;
                card[player].verti = true;
            }
        }
        const pointsRemaining = [];
        for (let line of board) {
            for (let card of line) {
                if (card.status === player && !card[player].inStreak) {
                    pointsRemaining.push(getCardValue(card, player));
                }
            }
        }
        pointsRemaining.sort((a, b) => a - b);
        let amount = 0;
        for (let point of pointsRemaining) {
            amount += point;
        }
        state.game[player].points = amount;
    };
    // TODO no duplicate code
    const newRound = () => {
        state.game = Object.assign(Object.assign({}, state.game), { roundId: makeId(), board: getNewBoard(), nextAction: "selectHero", nextActionPlayer: ["player1", "player2"][Math.floor(Math.random() * 2)], player1: { gold: state.game.player1.gold, powers: [], powerReady: false, points: 0, ready: true }, player2: { gold: state.game.player2.gold, powers: [], powerReady: false, points: 0, ready: true } });
        distribute("player1");
        distribute("player2");
        evaluate("player1");
        evaluate("player2");
        const pick = getRandomFromDeck();
        state.game.pick = { x: pick.x, y: pick.y };
    };
    // TODO no duplicate code
    const newGame = (id, player1, player2) => {
        state.game = {
            id,
            roundId: makeId(),
            pick: { x: 0, y: 0 },
            board: getNewBoard(),
            nextAction: "selectHero",
            nextActionPlayer: ["player1", "player2"][Math.floor(Math.random() * 2)],
            player1Id: player1,
            player2Id: player2,
            player1: { gold: game_interface_1.START_GOLD, powers: [], powerReady: false, points: 0, ready: true },
            player2: { gold: game_interface_1.START_GOLD, powers: [], powerReady: false, points: 0, ready: true },
            misc: {
                player1: { elo: 0, name: "", roundWon: 0 },
                player2: { elo: 0, name: "", roundWon: 0 },
                endGameProcessed: false,
            }
        };
        distribute("player1");
        distribute("player2");
        evaluate("player1");
        evaluate("player2");
        const pick = getRandomFromDeck();
        state.game.pick = { x: pick.x, y: pick.y };
    };
    const loadGame = (loadedGame) => {
        state.game = loadedGame;
    };
    const getPlayerById = (playerId) => {
        return state.game.player1Id === playerId ? "player1" : "player2";
    };
    const canKnock = (player) => {
        if (state.game.nextActionPlayer === player && state.game.nextAction === "discard") {
            if (state.game[player].points <= game_interface_1.MIN_TO_KNOCK) {
                return true;
            }
        }
        return false;
    };
    const applyHeros = () => {
        const game = state.game;
        for (let player of ["player1", "player2"]) {
            for (let powerStr of state.game[player].powers) {
                if (powerStr === "deserterJack") {
                    ;
                    (() => {
                        while (true) {
                            const card = game.board[Math.floor(Math.random() * 8)][Math.floor(Math.random() * 8)];
                            if (card.status === player) {
                                card.status = "deck";
                                card[player].status = "deck";
                                return;
                            }
                        }
                    })();
                }
            }
        }
    };
    const selectPowers = (playerId, selectedPowers) => {
        const player = getPlayerById(playerId);
        state.game[player].powers = selectedPowers;
        state.game[player].powerReady = true;
        if (state.game[op[player]].powerReady) {
            applyHeros();
            state.game.nextAction = "pick";
        }
        evaluate("player1");
        evaluate("player2");
    };
    const capitulate = (playerId) => {
        const player = getPlayerById(playerId);
        state.game.gameResult = {
            winner: op[player],
            revenge: { player1: "ask", player2: "ask" },
            reason: "capitulate"
        };
    };
    const onRoundEnd = () => {
        state.game.justPicked = undefined;
        state.game.player1.ready = false;
        state.game.player2.ready = false;
        const result = state.game.roundResult;
        state.game[result.winner].gold += result.pointsWin;
        state.game[op[result.winner]].gold += -result.pointsWin;
        for (let player of ["player1", "player2"]) {
            console.log(state.game[player].powers);
            for (let power of state.game[player].powers) {
                state.game[player].gold += -powers_1.powers[power].cost;
            }
        }
        if (state.game.player1.gold <= 0 && state.game.player1.gold <= 0) {
            state.game.player1.gold = 0;
            state.game.player2.gold = 0;
            state.game.gameResult = {
                winner: "draw",
                revenge: { player1: "ask", player2: "ask" },
                reason: "win"
            };
        }
        else if (state.game.player1.gold <= 0) {
            state.game.player1.gold = 0;
            state.game.gameResult = {
                winner: "player2",
                revenge: { player1: "ask", player2: "ask" },
                reason: "win"
            };
        }
        else if (state.game.player2.gold <= 0) {
            state.game.player2.gold = 0;
            state.game.gameResult = {
                winner: "player1",
                revenge: { player1: "ask", player2: "ask" },
                reason: "win"
            };
        }
    };
    const onZeroPoint = (player) => {
        if (state.game[player].points !== 0)
            throw "not zero points";
        const points = state.game[player].points;
        const pointsOp = state.game[op[player]].points;
        let result = {
            pointsWin: game_interface_1.FULL_POINTS,
            reason: "knock_full",
            winner: player,
            knocker: player
        };
        const diff = pointsOp - points;
        result.pointsWin += Math.abs(diff);
        state.game.roundResult = result;
        onRoundEnd();
    };
    const discard = (playerId, x, y) => {
        const player = getPlayerById(playerId);
        if (state.game.nextActionPlayer !== player)
            throw "not you to play";
        if (state.game.nextAction !== "discard")
            throw "not discard time";
        const card = state.game.board[y][x];
        if (card.status !== player)
            throw "not your card";
        card.status = "deck";
        card[player].status = "deck";
        card[op[player]].villainRefused = true;
        state.game.pick = { x, y };
        state.game.justPicked = undefined;
        state.game.nextAction = "pick";
        state.game.nextActionPlayer = op[player];
        evaluate("player1");
        evaluate("player2");
        if (state.game[player].points === 0) {
            onZeroPoint(player);
        }
    };
    const knock = (playerId) => {
        const player = getPlayerById(playerId);
        if (state.game.nextActionPlayer !== player)
            throw "not you to play";
        if (state.game.nextAction !== "discard")
            throw "not pick time";
        if (!canKnock(player))
            throw "cannot knock";
        const points = state.game[player].points;
        const pointsOp = state.game[op[player]].points;
        let result = {
            pointsWin: 0,
            reason: "knock_win",
            winner: player,
            knocker: player
        };
        const diff = pointsOp - points;
        if (points >= pointsOp) {
            result.reason = "knock_lost";
            result.winner = op[player];
            result.pointsWin += game_interface_1.SANCTION_POINTS;
        }
        result.pointsWin += Math.abs(diff);
        state.game.roundResult = result;
        onRoundEnd();
    };
    const setReady = (playerId) => {
        const player = getPlayerById(playerId);
        if (!state.game.roundResult)
            throw "not the time to be ready";
        state.game[player].ready = true;
        if (state.game.player1.ready && state.game.player2.ready) {
            newRound();
            state.game.roundResult = undefined;
        }
    };
    const pickRandom = (playerId) => {
        const player = getPlayerById(playerId);
        if (state.game.nextActionPlayer !== player)
            throw "not you to play";
        if (state.game.nextAction !== "pick")
            throw "not pick time";
        const pick = state.game.board[state.game.pick.y][state.game.pick.x];
        pick.status = "lost";
        pick[op[player]].villainRefused = true;
        pick[player].status = "lost";
        pick[op[player]].status = "lost";
        let totalRemaining = 0;
        for (let line of state.game.board) {
            for (let piece of line) {
                if (piece.status === "deck") {
                    totalRemaining += 1;
                }
            }
        }
        if (totalRemaining === 0) {
            for (let line of state.game.board) {
                for (let piece of line) {
                    if (piece.status === "lost") {
                        piece.status = "deck";
                        piece.player1.status = "deck";
                        piece.player1.villainRefused = false;
                        piece.player2.status = "deck";
                        piece.player2.villainRefused = false;
                    }
                }
            }
        }
        const card = getRandomFromDeck();
        state.game.justPicked = { x: card.x, y: card.y };
        card.status = player;
        card[player].status = player;
        evaluate("player1");
        evaluate("player2");
        state.game.pick = undefined;
        state.game.nextAction = "discard";
        if (state.game[player].points === 0) {
            onZeroPoint(player);
        }
    };
    const pickGreen = (playerId) => {
        const player = getPlayerById(playerId);
        if (state.game.nextActionPlayer !== player)
            throw "not you to play";
        if (state.game.nextAction !== "pick")
            throw "not pick time";
        const gameCard = state.game.board[state.game.pick.y][state.game.pick.x];
        state.game.justPicked = { x: gameCard.x, y: gameCard.y };
        gameCard.status = player;
        gameCard[player].status = player;
        gameCard[op[player]].status = player;
        evaluate("player1");
        evaluate("player2");
        state.game.pick = undefined;
        state.game.nextAction = "discard";
        if (state.game[player].points === 0) {
            onZeroPoint(player);
        }
    };
    const getUserGame = (playerId) => {
        const you = state.game.player1Id === playerId ? "player1" : "player2";
        const villain = state.game.player1Id === playerId ? "player2" : "player1";
        const getVillainStatus = () => {
            return Object.assign(Object.assign({}, state.game[villain]), { points: state.game.roundResult ? state.game[villain].points : undefined, powers: state.game.nextAction === "selectHero" ? undefined : state.game[villain].powers });
        };
        const possibleKnock = canKnock(you);
        const getInfos = () => {
            if (state.game.roundResult) {
                let line2 = "";
                let line1 = "";
                if (state.game.roundResult.reason === "knock_full") {
                    line1 = `${state.game.roundResult.knocker === you ? "you" : "he"} made FULL and won ${state.game.roundResult.pointsWin}`;
                }
                else if (state.game.roundResult.reason === "knock_win") {
                    line1 = `${state.game.roundResult.knocker === you ? "you" : "scum"} Knocked with ${state.game[state.game.roundResult.knocker].points} points`;
                    line2 = `${state.game.roundResult.knocker === you ? "you" : "he"}  won ${state.game.roundResult.pointsWin}`;
                }
                else {
                    line1 = `${state.game.roundResult.knocker === you ? "you" : "scum"} Knocked with ${state.game[state.game.roundResult.knocker].points} points`;
                    line2 = `${state.game.roundResult.knocker === you ? "scum" : "you"} counter knocked and won ${state.game.roundResult.pointsWin}`;
                }
                return {
                    line1,
                    line2
                };
            }
            else {
                if (state.game.nextAction === "selectHero") {
                    if (!state.game[you].powerReady) {
                        return {
                            line1: "Choose powers (2 max)",
                            line2: `You will play ${state.game.nextActionPlayer === you ? "first" : "second"}`,
                        };
                    }
                    else {
                        return {
                            line1: "Waiting scum to choose powers",
                            line2: "He is taking soo much time",
                        };
                    }
                }
                else if (state.game.nextAction === "pick") {
                    if (state.game.nextActionPlayer === you) {
                        return {
                            line1: "Pick green or random",
                            line2: ""
                        };
                    }
                    else {
                        return {
                            line1: "It is scum turn to pick",
                            line2: ""
                        };
                    }
                }
                else if (state.game.nextAction === "discard") {
                    if (state.game.nextActionPlayer === you) {
                        return {
                            line1: "Discard a piece",
                            line2: possibleKnock ? `or knock ${state.game[you].points}` : ""
                        };
                    }
                    else {
                        return {
                            line1: "It is scum turn",
                            line2: "to discard a piece"
                        };
                    }
                }
            }
            return {
                line1: "",
                line2: "",
            };
        };
        const getUserCard = (card) => {
            let streak = false;
            if (card.status === you && card[you].inStreak) {
                streak = true;
            }
            if (state.game.roundResult && card.status === villain && card[villain].inStreak) {
                streak = true;
            }
            const res = Object.assign(Object.assign({}, card), { player1: undefined, player2: undefined, status: Object.assign(Object.assign({}, card[you]), { status: state.game.roundResult ? card.status : card[you].status, inStreak: streak }), points: getCardValue(card, you) });
            return res;
        };
        const userGame = Object.assign(Object.assign({}, state.game), { you,
            villain, board: state.game.board.map(line => line.map(card => getUserCard(card))), justPicked: state.game.nextActionPlayer === you ? state.game.justPicked : undefined, player1: undefined, player2: undefined, youStatus: state.game[you], opStatus: getVillainStatus(), infos: getInfos(), canKnock: possibleKnock });
        return userGame;
    };
    return {
        state,
        funcs: {
            newGame,
            loadGame,
            getUserGame,
            selectPowers,
            pickGreen,
            pickRandom,
            discard,
            knock,
            setReady,
            getPlayerById,
            capitulate
        }
    };
};
exports.gameEngine = gameEngine;
