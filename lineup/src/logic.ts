import { io, connect } from "socket.io-client"
import { render } from "./render";
import state from "./state"

const socket = io(`${window.location.origin}`, {
    path: "/api",
    upgrade: false,
    transports: ['websocket'],
});

socket.on("welcome", (id) => {
    state.welcomed = true;
    render("global");
})

export const isLoggued = () => {

}