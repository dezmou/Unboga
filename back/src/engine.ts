import { BOARD_SIZE, CardStatus, Game, INITIAL_CARD_AMOUNT, Player, UserCard, UserGame } from "./common/game.interface"
import { powers } from "./powers"

const makeId = () => {
    return Math.floor((1 + Math.random()) * 0x1000000000000000)
        .toString(32)
}

export const gameEngine = () => {
    const state = {
        game: undefined as Game | undefined
    }

    const op = {
        player1: "player2" as Player,
        player2: "player1" as Player,
    }

    const getNewBoard = () => {
        const getBasePoint = (x: number, y: number) => {
            if (x >= 4) x += -1
            if (y >= 4) y += -1
            return ((Math.abs(x - 3) + Math.abs(y - 3)) * 2) + 1
        }

        const board: Game["board"] = [];

        const initCardStatus = (x: number, y: number): UserCard => ({
            status: "deck",
            villainRefused: false,
            points: getBasePoint(x, y),
            hori: false,
            inStreak: false,
            verti: false,
        })

        for (let y = 0; y < BOARD_SIZE; y++) {
            const line: Game["board"][number] = [];
            for (let x = 0; x < BOARD_SIZE; x++) {
                line.push({
                    id: `${x}_${y}`,
                    player1: initCardStatus(x, y),
                    player2: initCardStatus(x, y),
                    status: "deck",
                    x,
                    y,
                    basePoints: getBasePoint(x, y)
                })
            }
            board.push(line);
        }
        return board;
    }

    const getRandomFromDeck = () => {
        while (true) {
            const card = state.game!.board[Math.floor(Math.random() * BOARD_SIZE)][Math.floor(Math.random() * BOARD_SIZE)]
            if (card.status === "deck") return card
        }
    }

    const distribute = (player: Player) => {
        for (let i = 0; i < INITIAL_CARD_AMOUNT; i++) {
            const card = getRandomFromDeck()
            card.status = player
            card[player].status = player
        }
    }

    const getCardValue = (card: Game["board"][number][number], player: Player) => {
        return card.basePoints;
    }

    const evaluate = (player: Player) => {
        const horiStreak = []
        const vertiStreak = []
        const board = state.game!.board
        for (let y = 0; y < BOARD_SIZE; y++) {
            let streak = [];
            for (let x = 0; x < BOARD_SIZE; x++) {
                const card = board[y][x]
                if (card.status === player) {
                    streak.push(card);
                }
                if (card.status !== player || x + 1 === BOARD_SIZE) {
                    if (streak.length >= 3) {
                        horiStreak.push(streak);
                    }
                    streak = [];
                }
            }
        }

        for (let x = 0; x < BOARD_SIZE; x++) {
            let streak = [];
            for (let y = 0; y < BOARD_SIZE; y++) {
                const card = board[y][x]
                if (card.status === player) {
                    streak.push(card);
                }
                if (card.status !== player || y + 1 === BOARD_SIZE) {
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
        state.game![player].points = amount
    }

    const newGame = (id: string, player1: string, player2: string) => {
        state.game = {
            id,
            roundId: makeId(),
            pick: { x: 0, y: 0 },
            board: getNewBoard(),
            nextAction: "selectHero",
            nextActionPlayer: ["player1" as Player, "player2" as Player][1],
            player1Id: player1,
            player2Id: player2,
            player1: { gold: 100, powers: [], powerReady: false, points: 0 },
            player2: { gold: 100, powers: [], powerReady: false, points: 0 },
        }
        distribute("player1");
        distribute("player2");
        evaluate("player1")
        evaluate("player2")
        const pick = getRandomFromDeck();
        state.game.pick = { x: pick.x, y: pick.y }
    }

    const loadGame = (loadedGame: Game) => {
        state.game = loadedGame
    }

    const getPlayerById = (playerId: string) => {
        return state.game!.player1Id === playerId ? "player1" : "player2" as Player
    }

    const selectPowers = (playerId: string, selectedPowers: (keyof typeof powers)[]) => {
        const player = getPlayerById(playerId);
        state.game![player].powers = selectedPowers;
        state.game![player].powerReady = true;
        if (state.game![op[player]].powerReady) {
            state.game!.nextAction = "pick"
        }
    }

    const pickRandom = (playerId: string) => {
        const player = getPlayerById(playerId)
        if (state.game!.nextActionPlayer !== player) throw "not you to play"
        if (state.game!.nextAction !== "discard") throw "not discard time"
        const pick = state.game!.board[state.game!.pick!.y][state.game!.pick!.x]
        pick.status = "lost"
        pick[op[player]].villainRefused = true;
        pick[player].status = "lost";
        pick[op[player]].status = "lost";

        const card = getRandomFromDeck();
        card.status = player
        card[player].status = player

        evaluate("player1")
        evaluate("player2")
        state.game!.nextAction = "pick"
        state.game!.nextActionPlayer = op[state.game!.nextActionPlayer];
    }

    const pickGreen = (playerId: string) => {
        const player = getPlayerById(playerId)
        if (state.game!.nextActionPlayer !== player) throw "not you to play"
        if (state.game!.nextAction !== "pick") throw "not pick time"
        const gameCard = state.game!.board[state.game!.pick!.y][state.game!.pick!.x]
        gameCard.status = player;
        gameCard[player].status = player;
        gameCard[op[player]].status = player;
        evaluate("player1")
        evaluate("player2")
        state.game!.nextAction = "discard"
    }

    const getUserGame = (playerId: string) => {
        const you = state.game!.player1Id === playerId ? "player1" : "player2";
        const villain = state.game!.player1Id === playerId ? "player2" : "player1";

        const getVillainStatus = (): UserGame["opStatus"] => {
            return {
                ...state.game![villain],
                points: undefined,
                powers: undefined,
            }
        }

        const getInfos = (): UserGame["infos"] => {
            if (state.game!.nextAction === "selectHero") {
                if (!state.game![you].powerReady) {
                    return {
                        line1: "Choose powers (2 max)",
                        line2: "",
                    }
                } else {
                    return {
                        line1: "Waiting scum to choose powers",
                        line2: "He is taking soo much time",
                    }
                }
            } else if (state.game!.nextAction === "pick") {
                if (state.game!.nextActionPlayer === you) {
                    return {
                        line1: "Take target or random",
                        line2: ""
                    }
                } else {
                    return {
                        line1: "It is scum turn to pick",
                        line2: ""
                    }
                }
            } else if (state.game!.nextAction === "discard") {
                if (state.game!.nextActionPlayer === you) {
                    return {
                        line1: "Discard a piece",
                        line2: ""
                    }
                } else {
                    return {
                        line1: "It is scum turn",
                        line2: "to discard a piece"
                    }
                }
            }
            return {
                line1: "",
                line2: "",
            }
        }

        const userGame: UserGame = {
            ...state.game!,
            you,
            villain,
            board: state.game!.board.map(line => line.map(card => ({
                ...card,
                player1: undefined,
                player2: undefined,
                status: card[you],
                points: card.basePoints
            }))),
            player1: undefined,
            player2: undefined,
            youStatus: state.game![you],
            opStatus: getVillainStatus(),
            infos: getInfos()
        }
        return userGame;
    }

    return {
        state,
        funcs: {
            newGame,
            loadGame,
            getUserGame,
            selectPowers,
            pickGreen,
            pickRandom,
        }
    }
}