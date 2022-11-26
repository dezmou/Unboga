import { State } from "../back/src/common/api.interface"

export const global = {
    localState: {
        user: undefined as {
            id: string
            token: string
        } | undefined,
        ready: false,
        welcomed: false,
    },
    state: {
        connected: false
    } as State
}
