console.log("CHIENrouge");

export type Call = "login" | "askState"

type ApiCallBase = {
    user? : {
        id : string 
        token : string
    }
}

export interface CreateUser extends ApiCallBase {
    action: "creatUser"
    name: String;
    password: string
}

export interface AskState extends ApiCallBase {
    action: "askState"
}

export type ApiCAll = CreateUser | AskState

export type State = {
    connected : boolean
    render : string[]
}