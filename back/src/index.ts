import { onReady } from "./bdd"
import { ToastEvent } from "./common/api.interface"
import { acceptChallenge, cancelChallenge, challenge } from "./lobby"
import { io } from "./state"
import { askState, createUser, disconnect, login } from "./users"

const handles = {
    "challenge": { func: challenge, toastIfFail: true, },
    "acceptChallenge": { func: acceptChallenge, toastIfFail: true, },
    "cancelChallenge": { func: cancelChallenge, toastIfFail: true, },
    "login": { func: login, toastIfFail: true, },
    "createUser": { func: createUser, toastIfFail: true, },
    "askState": { func: askState, toastIfFail: true },
    "disconnect": { func: disconnect, toastIfFail: false },
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
                    let params = p;
                    try { params = JSON.parse(p) } catch (e) { }
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
                }
            })
        }
    });
})
