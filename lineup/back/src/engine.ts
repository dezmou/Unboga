type cardStatus = "deck" | "player1" | "player2" | "lost"
type UserCard = {
    status: cardStatus
    villainRefused: boolean
}

export interface Game {
    player1: string;
    player2: string;
    nextAction: "selectHero" | "pick" | "discard"
    nextActionPlayer: "player1" | "player2"
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
            return 4
        }

        const board: Game["board"] = [];
        for (let y = 0; y < 7; y++) {
            const line: Game["board"][number] = [];
            for (let x = 0; x < 7; x++) {
                line.push({
                    id: `${x}_${y}`,
                    player1: { status: "deck", villainRefused: false },
                    player2: { status: "deck", villainRefused: false },
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

    const newGame = (player1: string, player2: string) => {
        state.game = {
            board: getNewBoard(),
            nextAction: "selectHero",
            nextActionPlayer: ["player1" as "player1", "player2" as "player2"][1],
            player1,
            player2,
        }
    }

    const loadGame = (loadedGame: Game) => {
        state.game = loadedGame
    }

    const getUserState = (player: "player1" | "player2") => {

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