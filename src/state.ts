import { LobbyEntry, State } from "../common/src/api.interface"
import lang from "../common/src/langage/index"

export const global = {
    localState: {
        user: undefined as {
            id: string
            token: string
        } | undefined,
        ready: false,
        welcomed: false,
        size: {
            width: 0,
            height: 0
        },
        toast: {
            msg: "",
            opened: false,
            color: "",
            time: 0,
        },
        hideButtons: false,
        langage: "en" as keyof typeof lang,
    },
    lobby: {} as { [key: string]: LobbyEntry },
    state: {
        page: "blank",
        connected: false,
        render: ["global"]
    } as State
}