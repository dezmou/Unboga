import { io, connect } from "socket.io-client"
import { render } from "./render";
import { localState, state } from "./state"
import { ApiCAll, Call } from "../common/api.interface"

const socket = io(`${window.location.origin}`, {
    path: "/api",
    upgrade: false,
    transports: ['websocket'],
});

export const isLoggued = () => { }

const apiCAll = (params: ApiCAll) => {
    socket.emit(JSON.stringify(params));
}

const askState = () => {
    apiCAll({ action: "askState" })
}

const main = async () => {
    socket.on("welcome", (id) => {
        const user = localStorage.getItem("user");
        localState.user = user ? JSON.parse(user) : undefined
        askState();

        localState.welcomed = true;
        render("global");
    })
}

main();