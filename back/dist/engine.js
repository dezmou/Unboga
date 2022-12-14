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
    const state = {};
    const op = {
        player1: "player2",
        player2: "player1",
    };
    const getOpId = (id) => {
        return state.game.player1Id === id ? state.game.player2Id : state.game.player1Id;
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
            hori: "none",
            inStreak: false,
            verti: "none",
            diagNeg: "none",
            diagPos: "none",
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
        let points = card.basePoints;
        if (state.game[player].powers.includes("eye")) {
            points = card.basePoints * 2;
        }
        if (state.game[player].powers.includes("mirror")) {
            if (state.game[player].powers.includes("eye")) {
                points = 28 - points;
            }
            else {
                points = 14 - points;
            }
        }
        return points;
    };
    const getAllDiagonal = () => {
        const board = state.game.board;
        const max_col = board[0].length;
        const max_row = board.length;
        const cols = Array.from({ length: max_col }).map(e => []);
        const rows = Array.from({ length: max_row }).map(e => []);
        const fdiag = Array.from({ length: max_row + max_col - 1 }).map(e => []);
        const bdiag = Array.from({ length: fdiag.length }).map(e => []);
        const min_bdiag = -max_row + 1;
        for (let x = 0; x < max_col; x++) {
            for (let y = 0; y < max_row; y++) {
                cols[x].push(board[y][x]);
                rows[y].push(board[y][x]);
                fdiag[x + y].push(board[y][x]);
                bdiag[x - y - min_bdiag].push(board[y][x]);
            }
        }
        return [fdiag, bdiag];
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
                card[player].hori = "none";
                card[player].verti = "none";
                card[player].diagNeg = "none";
                card[player].diagPos = "none";
            }
        }
        for (let hori of horiStreak) {
            for (let card of hori) {
                card[player].inStreak = true;
                card[player].hori = "you";
            }
        }
        for (let verti of vertiStreak) {
            for (let card of verti) {
                card[player].inStreak = true;
                card[player].verti = "you";
            }
        }
        if (state.game[player].powers.includes("chimist")) {
            const allDiags = getAllDiagonal();
            for (let i = 0; i < 2; i++) {
                const diagStreak = [];
                const diags = allDiags[i];
                for (let diag of diags) {
                    let streak = [];
                    diag.forEach((card, i) => {
                        if (card.status === player) {
                            streak.push(card);
                        }
                        if (card.status !== player || i + 1 === diag.length) {
                            if (streak.length >= 3) {
                                diagStreak.push(streak);
                            }
                            streak = [];
                        }
                    });
                }
                for (let diag of diagStreak) {
                    for (let card of diag) {
                        card[player].inStreak = true;
                        card[player][i === 0 ? "diagNeg" : "diagPos"] = "you";
                    }
                }
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
        state.game = Object.assign(Object.assign({}, state.game), { roundId: makeId(), board: getNewBoard(), nextAction: "selectHero", nextActionPlayer: ["player1", "player2"][Math.floor(Math.random() * 2)], player1: { gold: state.game.player1.gold, goldPublic: state.game.player1.gold, powers: [], powerReady: false, points: 0, ready: true }, player2: { gold: state.game.player2.gold, goldPublic: state.game.player2.gold, powers: [], powerReady: false, points: 0, ready: true }, choose: [], chooseIndex: 0, pickHeroTurn: 0 });
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
            player1: { gold: game_interface_1.START_GOLD, goldPublic: game_interface_1.START_GOLD, powers: [], powerReady: false, points: 0, ready: true },
            player2: { gold: game_interface_1.START_GOLD, goldPublic: game_interface_1.START_GOLD, powers: [], powerReady: false, points: 0, ready: true },
            misc: {
                player1: { elo: 0, name: "", roundWon: 0 },
                player2: { elo: 0, name: "", roundWon: 0 },
                endGameProcessed: false,
            },
            choose: [],
            chooseIndex: 0,
            pickHeroTurn: 0,
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
    const getIdByPlayer = (player) => {
        return player === "player1" ? state.game.player1Id : state.game.player2Id;
    };
    const canKnock = (player) => {
        if (state.game.nextActionPlayer === player && state.game.nextAction === "discard") {
            if (state.game[player].powers.includes("final")) {
                return true;
            }
            if (state.game[player].points - (state.game[player].powers.filter(e => e === "watch").length * 10) <= game_interface_1.MIN_TO_KNOCK) {
                return true;
            }
        }
        return false;
    };
    const getAllCard = () => {
        const final = [];
        for (let line of state.game.board) {
            for (let card of line) {
                final.push(card);
            }
        }
        return final;
    };
    const shuffleCards = (cards) => {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return cards;
    };
    const applyHeros = () => {
        const game = state.game;
        const baseFirstPlayer = game.nextActionPlayer;
        const hurrys = { player1: 0, player2: 0 };
        for (let player of ["player1", "player2"]) {
            game[player].powers = game[player].powers.map(power => {
                if (power === "fox") {
                    const choices = Object.keys(powers_1.powers).filter(e => e !== "fox" && e !== "curse" && e !== "unknow");
                    return choices[Math.floor(Math.random() * choices.length)];
                }
                return power;
            });
        }
        if (game.player1.powers.includes("karen") || game.player2.powers.includes("karen")) {
            game.board = getNewBoard();
            distribute("player1");
            distribute("player2");
            const pick = getRandomFromDeck();
            game.pick = { x: pick.x, y: pick.y };
        }
        evaluate("player1");
        evaluate("player2");
        const stacyCardToAdd = {
            player1: [],
            player2: [],
        };
        for (let player of ["player1", "player2"]) {
            for (let powerStr of state.game[player].powers) {
                if (powerStr === "deserterJack") {
                    ;
                    (() => {
                        while (true) {
                            const card = game.board[Math.floor(Math.random() * game_interface_1.BOARD_SIZE)][Math.floor(Math.random() * game_interface_1.BOARD_SIZE)];
                            if (card.status === player) {
                                card.status = "deck";
                                card[player].status = "deck";
                                return;
                            }
                        }
                    })();
                }
                if (powerStr === "steve") {
                    hurrys[player] += 1;
                }
                if (powerStr === "pact") {
                    game.choose.push({
                        player1: { choosed: false, x: 0, y: 0 },
                        player2: { choosed: false, x: 0, y: 0 },
                        done: false,
                    });
                }
                if (powerStr === "monkeys") {
                    for (let i = 0; i < 2; i++) {
                        const cards = getAllCard()
                            .filter(c => c.status === player)
                            .sort((a, b) => getCardValue(a, player) - getCardValue(b, player));
                        const minCards = cards.filter(c => getCardValue(c, player) === getCardValue(cards[0], player));
                        const target = minCards[Math.floor(Math.random() * minCards.length)];
                        target.status = "deck";
                        target[player].status = "deck";
                    }
                }
            }
            if (state.game[player].powers.includes("chimist")) {
                shuffleCards(getAllCard()
                    .filter(e => e.status === op[player] && !e[op[player]].inStreak))
                    .sort((a, b) => b.basePoints - a.basePoints)
                    .forEach((card, i) => {
                    if (i < 4) {
                        stacyCardToAdd[player].push(card);
                    }
                });
            }
        }
        for (const player of ["player1", "player2"]) {
            for (const card of stacyCardToAdd[player]) {
                card.status = player;
                card[op[player]].status = player;
                card[player].status = player;
            }
        }
        if (hurrys.player1 !== hurrys.player2) {
            state.game.nextActionPlayer = hurrys.player1 > hurrys.player2 ? "player1" : "player2";
        }
    };
    const pickPower = (playerId, selectedPower) => {
        const player = getPlayerById(playerId);
        state.game[player].powers.push(selectedPower);
        state.game[player].powerReady = true;
        if (state.game[op[player]].powerReady) {
            if (!(state.game.player1.powers[state.game.pickHeroTurn] === "curse"
                && state.game.player2.powers[state.game.pickHeroTurn] === "curse")) {
                for (let player of ["player1", "player2"]) {
                    if (state.game[player].powers[state.game.pickHeroTurn] === "curse") {
                        state.game[op[player]].powers[state.game.pickHeroTurn] = "lucien";
                    }
                }
            }
            for (let player of ["player1", "player2"]) {
                if (!(state.game[player].powers.includes("fog")
                    && state.game[player].powers[state.game.pickHeroTurn] !== "fog")) {
                    state.game[player].goldPublic += -powers_1.powers[state.game[player].powers[state.game.pickHeroTurn]].cost;
                }
                state.game[player].gold += -powers_1.powers[state.game[player].powers[state.game.pickHeroTurn]].cost;
            }
            state.game.pickHeroTurn += 1;
            if (state.game.pickHeroTurn === 3) {
                onPowersSelected();
            }
            else {
                state.game.player1.powerReady = false;
                state.game.player2.powerReady = false;
            }
        }
    };
    const onPowersSelected = () => {
        applyHeros();
        const nbrChoose = state.game.player1.powers.filter(e => e === "pact").length + state.game.player2.powers.filter(e => e === "pact").length;
        if (nbrChoose > 0) {
            state.game.choose = Array.from({ length: nbrChoose }).map(() => ({
                done: false,
                player1: { choosed: false, x: 0, y: 0 },
                player2: { choosed: false, x: 0, y: 0 },
            }));
            state.game.nextAction = "choose";
        }
        else {
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
        if (result.reason === "knock_win") {
            result.pointsWin += (state.game[result.winner].powers.filter(e => e === "watch").length) * 10;
        }
        const basePointsWin = result.pointsWin;
        for (let player of ["player1", "player2"]) {
            // for (let power of state.game[player].powers) {
            //     state.game[player].gold += -powers[power as keyof typeof powers].cost;
            // }
            if (state.game[player].powers.includes("phone")) {
                result.pointsWin += Math.floor(basePointsWin * state.game[player].powers.filter(e => e === "phone").length * 0.3);
            }
        }
        state.game[result.winner].gold += result.pointsWin;
        state.game[op[result.winner]].gold += -result.pointsWin;
        if (state.game.player1.gold <= 0 && state.game.player2.gold <= 0) {
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
        state.game.player1.goldPublic = state.game.player1.gold;
        state.game.player2.goldPublic = state.game.player2.gold;
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
    // TODO onZeroPoints
    const choose = (playerId, x, y) => {
        const player = getPlayerById(playerId);
        if (state.game.nextAction !== "choose")
            throw "not choose time";
        if (state.game.nextActionPlayer !== player)
            throw "not you to play";
        const cho = state.game.choose[state.game.chooseIndex];
        cho[player].choosed = true;
        cho[player].x = x;
        cho[player].y = y;
        const piece = state.game.board[y][x];
        // if (piece.status === op[player]) {
        piece[op[player]].status = player;
        // }
        piece.status = player;
        piece[player].status = player;
        cho[player].choosed = true;
        if (cho.player1.choosed && cho.player2.choosed) {
            state.game.chooseIndex += 1;
            cho.done = true;
        }
        if (state.game.chooseIndex > state.game.choose.length - 1) {
            state.game.nextAction = "pick";
        }
        state.game.nextActionPlayer = op[player];
        evaluate("player1");
        evaluate("player2");
    };
    const pickGreen = (playerId) => {
        const player = getPlayerById(playerId);
        console.log("ccc", state.game.nextActionPlayer, player);
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
            const getVillainPowers = () => {
                const pows = state.game[villain].powers.map(pow => {
                    if (state.game.roundResult) {
                        return pow;
                    }
                    if (state.game[villain].powers.includes("fog")) {
                        if (pow !== "fog") {
                            return "unknow";
                        }
                    }
                    return pow;
                });
                if (state.game.nextAction === "selectHero") {
                    return pows.filter((e, i) => i < state.game.pickHeroTurn);
                }
                return pows;
            };
            return Object.assign(Object.assign({}, state.game[villain]), { points: (state.game.roundResult || state.game[you].powers.includes("eye")) ? state.game[villain].points : undefined, powers: getVillainPowers(), gold: state.game[villain].goldPublic });
        };
        const possibleKnock = canKnock(you);
        // for (let card of getAllCard()) { card[you].greenStreak = false; } //TODO do this in evaluate()
        if (state.game.pick) {
            const card = state.game.board[state.game.pick.y][state.game.pick.x];
            const fork = (0, exports.gameEngine)();
            fork.funcs.loadGame(JSON.parse(JSON.stringify(state.game)));
            fork.state.game.board[card.y][card.x].status = you;
            fork.state.game.board[card.y][card.x][you].status = you;
            fork.funcs.evaluate(you);
            // streak = true;
            const forkCards = fork.funcs.getAllCard();
            const cards = getAllCard();
            for (let i = 0; i < forkCards.length; i++) {
                const card = cards[i];
                const fCard = forkCards[i];
                if (card[you].hori === "none" && fCard[you].hori === "you")
                    card[you].hori = "futur";
                if (card[you].verti === "none" && fCard[you].verti === "you")
                    card[you].verti = "futur";
                if (card[you].diagNeg === "none" && fCard[you].diagNeg === "you")
                    card[you].diagNeg = "futur";
                if (card[you].diagPos === "none" && fCard[you].diagPos === "you")
                    card[you].diagPos = "futur";
            }
            card[you].inStreak = fork.state.game.board[card.y][card.x][you].inStreak;
        }
        const getUserCard = (card) => {
            var _a, _b;
            let streak = false;
            const iCanSeeOp = (state.game.roundResult || state.game[you].powers.includes("eye"))
                && ((_a = state.game) === null || _a === void 0 ? void 0 : _a.nextAction) !== "selectHero"
                && ((_b = state.game) === null || _b === void 0 ? void 0 : _b.nextAction) !== "choose";
            if (card.status === you && card[you].inStreak) {
                streak = true;
            }
            if (iCanSeeOp && card.status === villain && card[villain].inStreak) {
                streak = true;
            }
            if (state.game.pick && card.x === state.game.pick.x && card.y === state.game.pick.y && card[you].inStreak) {
                streak = true;
            }
            const res = Object.assign(Object.assign({}, card), { player1: undefined, player2: undefined, status: Object.assign(Object.assign(Object.assign({}, card[you]), { status: iCanSeeOp ? card.status : card[you].status, inStreak: streak }), (card.status === villain ? {
                    diagNeg: streak ? card[villain].diagNeg : "none",
                    diagPos: streak ? card[villain].diagPos : "none",
                    hori: streak ? card[villain].hori : "none",
                    verti: streak ? card[villain].verti : "none",
                } : {})), points: getCardValue(card, you) });
            return res;
        };
        const userGame = Object.assign(Object.assign({}, state.game), { you,
            villain, board: state.game.board.map(line => line.map(card => getUserCard(card))), justPicked: state.game.nextActionPlayer === you ? state.game.justPicked : undefined, player1: undefined, player2: undefined, youStatus: state.game[you], opStatus: getVillainStatus(), canKnock: possibleKnock });
        return userGame;
    };
    return {
        state,
        funcs: {
            newGame,
            loadGame,
            getUserGame,
            pickPower,
            pickGreen,
            pickRandom,
            discard,
            knock,
            setReady,
            getPlayerById,
            capitulate,
            getAllCard,
            choose,
            evaluate,
            getOpId,
        }
    };
};
exports.gameEngine = gameEngine;
