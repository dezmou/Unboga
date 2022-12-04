import { onReady } from "./bdd"
import { ToastEvent } from "./common/api.interface"
import { capitulate, play } from "./game"
import { acceptChallenge, cancelChallenge, challenge, playBot } from "./lobby"
import { io, socketIdToUserId } from "./state"
import { askState, createUser, disconnect, login } from "./users"

const handles = {
    // Unauthentified methods
    "login": { func: login, toastIfFail: true, mustBeConnected: false, },
    "createUser": { func: createUser, toastIfFail: true, mustBeConnected: false, },
    "askState": { func: askState, toastIfFail: true, mustBeConnected: false, },
    "disconnect": { func: disconnect, toastIfFail: false, mustBeConnected: false, },

    // Authentified methods
    "challenge": { func: challenge, toastIfFail: true, mustBeConnected: true, },
    "playBot": { func: playBot, toastIfFail: true, mustBeConnected: true, },
    "acceptChallenge": { func: acceptChallenge, toastIfFail: true, mustBeConnected: true, },
    "cancelChallenge": { func: cancelChallenge, toastIfFail: true, mustBeConnected: true, },
    "capitulate": { func: capitulate, toastIfFail: true, mustBeConnected: true, },
    "play": { func: play, toastIfFail: true, mustBeConnected: true, },
}

onReady.subscribe(() => {
    io.on('connection', (socket) => {
        console.log("USER CON");
        socket.emit("welcome", socket.id)

        for (let api of Object.entries(handles)) {
            const action = api[0]
            const handle = api[1]
            socket.on(action, async (p) => {
                try {
                    if (handle.mustBeConnected && !socketIdToUserId[socket.id]) {
                        if (!socketIdToUserId[socket.id]) {
                            socket.emit("reload", "");
                            throw "not authorized, reloading page..."
                        }
                    }
                    let params = p;
                    try { params = ({ ...JSON.parse(p), userId: socketIdToUserId[socket.id] }) } catch (e) { }
                    await handle.func(socket, params)
                } catch (e) {
                    console.log(e);
                    if (handle.toastIfFail) {
                        try {
                            socket.emit("toast", JSON.stringify({
                                color: "red",
                                msg: "Oops something went wrong",
                                time: 4000,
                            } as ToastEvent))
                        } catch (e) { }
                    }
                } finally {
                    console.log(socket.id, socketIdToUserId);
                }
            })
        }
    });
})
