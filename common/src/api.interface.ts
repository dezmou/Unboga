import { powers } from "./powers"
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

export interface PlayBot extends ApiCallBase {
    action: "playBot"
}

export interface ToastEvent {
    msg: string,
    color: string,
    time: number,
}

export interface Play extends ApiCallBase {
    action: "play";
    play: "pickPower" | "pickGreen" | "pickRandom" | "discard" | "knock" | "ready" | "exitLobby" | "revenge" | "capitulate" | "choose"
    gameId: string;
}

export interface PlayPickPower extends Play {
    play: "pickPower"
    powers: (keyof typeof powers)
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

export interface ExitLobby extends Play {
    play: "exitLobby"
}

export interface Capitulate extends Play {
    play: "capitulate"
}

export interface Revenge extends Play {
    play: "revenge"
}

export interface PlayKnock extends Play {
    play: "knock"
}

export interface PlayChosse extends Play {
    play: "choose",
    x: number,
    y: number
}

export interface PlayDiscard extends Play {
    play: "discard",
    x: number,
    y: number
}

export type ApiCAll = CreateUser | AskState | Login | Challenge | AcceptChallenge | CancelChallenge | Capitulate | Play | PlayBot

export interface LobbyEntry {
    elo: number,
    id: string,
    name: string,
    status: "online" | "inGame"
    challenge?: { player1: string, player2: string, initiator: string }
}

export type Consume = { audios: string[] }

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
    consume?: Consume
}