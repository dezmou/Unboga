import { BOARD_SIZE, Game, Player, UserGame } from "./common/game.interface"


export const gameEngine = () => {
    const state = {
        game: undefined as Game | undefined
    }

    const getNewBoard = () => {
        const getBasePoint = (x: number, y: number) => {
            if (x >= 4) x += -1
            if (y >= 4) y += -1
            return ((Math.abs(x - 3) + Math.abs(y - 3)) * 2) + 1
        }

        const board: Game["board"] = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            const line: Game["board"][number] = [];
            for (let x = 0; x < BOARD_SIZE; x++) {
                line.push({
                    id: `${x}_${y}`,
                    player1: { status: "deck", villainRefused: false, points: getBasePoint(x, y) },
                    player2: { status: "deck", villainRefused: false, points: getBasePoint(x, y) },
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
        for (let i = 0; i < 8; i++) {
            const card = getRandomFromDeck()
            card.status = player
            card[player].status = player
        }
    }

    const newGame = (id: string, player1: string, player2: string) => {
        state.game = {
            id,
            pick: { x: 0, y: 0 },
            board: getNewBoard(),
            nextAction: "selectHero",
            nextActionPlayer: ["player1" as Player, "player2" as Player][1],
            player1Id: player1,
            player2Id: player2,
        }
        distribute("player1");
        distribute("player2");
        const pick = getRandomFromDeck();
        state.game.pick = { x: pick.x, y: pick.y }
    }

    const loadGame = (loadedGame: Game) => {
        state.game = loadedGame
    }

    const getUserGame = (playerId: string) => {
        const you = state.game!.player1Id === playerId ? "player1" : "player2";
        const villain = state.game!.player1Id === playerId ? "player2" : "player1";

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
            })))
        }
        return userGame;
    }

    return {
        state,
        funcs: {
            newGame,
            loadGame,
            getUserGame,
        }
    }
}