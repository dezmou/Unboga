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

export interface AskState extends ApiCallBase {
    action: "askState"
}

export type ApiCAll = CreateUser | AskState

export type State = {
    page: "blank" | "login" | "lobby" | "game"
    render: string[]
    user?: {
        name: string
        token: string
        elo: number
    }
}