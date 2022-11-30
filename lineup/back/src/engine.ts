type cardStatus = "deck" | "player1" | "player2" | "lost"
type UserCard = {
    status: cardStatus
    villainRefused: boolean
    points: number,
}

export type Player = "player1" | "player2"

export interface Game {
    _id: string
    player1: string;
    player2: string;
    nextAction: "selectHero" | "pick" | "discard"
    nextActionPlayer: Player
    board: {
        id: string
        x: number
        y: number
        status: cardStatus
        player1: UserCard
        player2: UserCard
        basePoints: number
    }[][]
}


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
        for (let y = 0; y < 7; y++) {
            const line: Game["board"][number] = [];
            for (let x = 0; x < 7; x++) {
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
            const card = state.game!.board[Math.floor(Math.random() * 7)][Math.floor(Math.random() * 7)]
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

    const newGame = (player1: string, player2: string) => {
        const makeId = () => {
            return Math.floor((1 + Math.random()) * 0x100000000000000000)
                .toString(32)
        }

        state.game = {
            _id: makeId(),
            board: getNewBoard(),
            nextAction: "selectHero",
            nextActionPlayer: ["player1" as Player, "player2" as Player][1],
            player1,
            player2,
        }
        distribute("player1");
        distribute("player2");
    }

    const loadGame = (loadedGame: Game) => {
        state.game = loadedGame
    }

    const getUserState = (player: Player) => {

    }

    return {
        state,
        funcs: {
            newGame,
            loadGame,
            getUserState,
        }
    }
}