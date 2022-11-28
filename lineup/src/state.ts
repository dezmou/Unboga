import { State } from "../back/src/common/api.interface"

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
        }
    },
    state: {
        page: "blank",
        connected: false,
        render: ["global"]
    } as State
}
