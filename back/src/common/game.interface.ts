export type cardStatus = "deck" | "player1" | "player2" | "lost"

export type UserCard = {
    status: cardStatus
    villainRefused: boolean
    points: number,
}

export type Player = "player1" | "player2"

export type Game = {
    id: string
    player1Id: string;
    player2Id: string;
    nextAction: "selectHero" | "pick" | "discard"
    nextActionPlayer: Player
    pick: { x: number, y: number }
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

type Modify<T, R> = Omit<T, keyof R> & R;
export type UserGame = Modify<Game, {
    you: Player
    villain: Player
    board: {
        id: string
        x: number
        y: number
        status: UserCard
        points: number
        player1: undefined
        player2: undefined
    }[][]
}>
