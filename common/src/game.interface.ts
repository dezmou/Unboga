import { powers } from "./powers"
type Modify<T, R> = Omit<T, keyof R> & R;

export const BOARD_SIZE = 8
export const INITIAL_CARD_AMOUNT = 12
export const MIN_TO_KNOCK = 30
export const FULL_POINTS = 30
export const SANCTION_POINTS = 30
export const START_GOLD = 250
export const MAX_POWER_NUMBER = 3
export const BOT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

export type CardStatus = "deck" | "player1" | "player2" | "lost"

export type UserCard = {
    status: CardStatus
    villainRefused: boolean
    points: number
    inStreak: boolean
    hori:  "futur" | "you" | "none"
    verti:  "futur" | "you" | "none"
    diagPos:  "futur" | "you" | "none"
    diagNeg:  "futur" | "you" | "none"
}
export type PlayerStatus = {
    gold: number
    goldPublic: number
    powers: (keyof typeof powers)[]
    powerReady: boolean
    points: number
    ready: boolean
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
    nextAction: "selectHero" | "pick" | "discard" | "choose"
    nextActionPlayer: Player
    pick?: { x: number, y: number }
    justPicked?: { x: number, y: number }
    player1: PlayerStatus
    player2: PlayerStatus
    choose: {
        player1: { choosed: boolean, x: number, y: number },
        player2: { choosed: boolean, x: number, y: number },
        done: boolean,
    }[]
    chooseIndex: number
    roundResult?: {
        knocker: Player
        winner: Player
        pointsWin: number
        reason: "knock_win" | "knock_lost" | "knock_full"
    }
    gameResult?: {
        winner: Player | "draw"
        reason: "win" | "capitulate"
        revenge: { player1: "ask" | "yes" | "no", player2: "ask" | "yes" | "no" }
    }
    board: {
        id: string
        x: number
        y: number
        status: CardStatus
        player1: UserCard
        player2: UserCard
        basePoints: number
    }[][],
    misc: {
        player1: { name: string, elo: number, roundWon: number },
        player2: { name: string, elo: number, roundWon: number },
        endGameProcessed: boolean,
    }
    pickHeroTurn: number
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
    canKnock: boolean
    player1: undefined
    player2: undefined
    youStatus: PlayerStatus
    opStatus: OpStatus
}>