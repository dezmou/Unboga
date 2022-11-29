console.log("CHIENrouge");

export type Call = "login" | "askState"

type ApiCallBase = {
    user?: {
        id: string
        token: string
    }
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

export interface AskState extends ApiCallBase {
    action: "askState"
}

export interface ToastEvent {
    msg: string,
    color: string,
    time: number,
}

export type ApiCAll = CreateUser | AskState | Login

export interface LobbyEntry {
    elo: number,
    id: string,
    name: string,
    status: "online" | "inGame"
}

export type State = {
    page: "blank" | "login" | "lobby" | "game"
    render: string[]
    user?: {
        name: string
        token: string
        elo: number
    }
}