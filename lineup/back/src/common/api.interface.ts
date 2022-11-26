console.log("CHIENrouge");

export type Call = "login" | "askState"

export type CreateUser = {
    action: "creatUser"
    name: String;
    password: string
}

export type AskState = {
    action: "askState"
    user?: { name: String, token: string }
}

export type ApiCAll = CreateUser | AskState

export interface State {
    connected : boolean
}