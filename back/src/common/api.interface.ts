import { powers } from "../powers"
import { UserGame } from "./game.interface"

export type Call = "login" | "askState"

export type ApiCallBase = {
    user?: {
        id: string
        token: string
    }
    userId?: string
}

export interface CreateUser extends ApiCallBase {
    action: "createUser"
    name: string;
    password: string
}

export interface Capitulate extends ApiCallBase {
    action: "capitulate";
    gameId: string;
}

export interface Login extends ApiCallBase {
    action: "login";
    name: string;
    password: string
}

export interface Challenge extends ApiCallBase {
    action: "challenge";
    id: string;
}

export interface AskState extends ApiCallBase {
    action: "askState"
}

export interface AcceptChallenge extends ApiCallBase {
    action: "acceptChallenge"
}

export interface CancelChallenge extends ApiCallBase {
    action: "cancelChallenge"
}

export interface ToastEvent {
    msg: string,
    color: string,
    time: number,
}

export interface Play extends ApiCallBase {
    action: "play";
    play: "selectPower" | "pickGreen" | "pickRandom" | "discard" | "knock" | "ready"
    gameId: string;
}

export interface PlaySelectPowers extends Play {
    play: "selectPower"
    powers: (keyof typeof powers)[]
}

export interface PlayPickGreen extends Play {
    play: "pickGreen"
}

export interface PlayPickRandom extends Play {
    play: "pickRandom"
}

export interface PlayReady extends Play {
    play: "ready"
}

export interface PlayKnock extends Play {
    play: "knock"
}

export interface PlayDiscard extends Play {
    play: "discard",
    x: number,
    y: number
}

export type ApiCAll = CreateUser | AskState | Login | Challenge | AcceptChallenge | CancelChallenge | Capitulate | Play

export interface LobbyEntry {
    elo: number,
    id: string,
    name: string,
    status: "online" | "inGame"
    challenge?: { player1: string, player2: string, initiator: string }
}

export type State = {
    page: "blank" | "login" | "lobby" | "game"
    render: string[]
    user?: {
        id: string
        name: string
        token: string
        elo: number
    }
    inGame?: string
    game?: UserGame
}