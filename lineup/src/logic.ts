import { io, connect } from "socket.io-client"
import { render } from "./render";
import { global } from "./state"
import { ApiCAll, Call, State } from "../back/src/common/api.interface"

const socket = io(`${window.location.origin}`, {
    path: "/api",
    upgrade: false,
    transports: ['websocket'],
});

export const isLoggued = () => { }

const apiCAll = (params: ApiCAll) => {
    socket.emit(params.action, JSON.stringify(params));
}

const askState = () => {
    apiCAll({ action: "askState" })
}

const main = async () => {
    socket.on("welcome", (id) => {
        const user = localStorage.getItem("user");
        global.localState.user = user ? JSON.parse(user) : undefined
        askState();
        global.localState.welcomed = true;
        render("global");
    })

    socket.on("newState", (state: State) => {
        global.localState.ready = true;
        global.state = state;
        render("global");
    })
}

main();