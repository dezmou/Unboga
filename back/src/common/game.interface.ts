import { powers } from "../powers"
type Modify<T, R> = Omit<T, keyof R> & R;

export const BOARD_SIZE = 8
export const INITIAL_CARD_AMOUNT = 12

export type CardStatus = "deck" | "player1" | "player2" | "lost"

export type UserCard = {
    status: CardStatus
    villainRefused: boolean
    points: number
    inStreak: boolean
    hori: boolean
    verti: boolean
}
export type PlayerStatus = {
    gold: number
    powers: (keyof typeof powers)[]
    powerReady: boolean
    points: number
}

export type OpStatus = Modify<PlayerStatus, {
    powers?: (keyof typeof powers)[]
    points?: number
}>

export type Player = "player1" | "player2"

export type Game = {
    id: string
    roundId: string
    player1Id: string;
    player2Id: string;
    nextAction: "selectHero" | "pick" | "discard"
    nextActionPlayer: Player
    pick?: { x: number, y: number }
    player1: PlayerStatus
    player2: PlayerStatus
    board: {
        id: string
        x: number
        y: number
        status: CardStatus
        player1: UserCard
        player2: UserCard
        basePoints: number
    }[][]
}

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
    player1: undefined
    player2: undefined
    youStatus: PlayerStatus
    opStatus: OpStatus
    infos: {
        line1: string
        line2: string
    }
}>