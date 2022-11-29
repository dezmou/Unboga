import { getUser, onReady } from "./bdd"
import { ApiCallBase, AskState, State, ToastEvent } from "./common/api.interface"
import { acceptChallenge, cancelChallenge, challenge, updateLobby } from "./lobby"
import { io, lobby, socketIdToUserId, SSocket, userIdToSocket } from "./state"
import { askState, createUser, login } from "./users"

const handles = {
    "challenge": { func: challenge, toastIfFail: true, },
    "acceptChallenge": { func: acceptChallenge, toastIfFail: true, },
    "cancelChallenge": { func: cancelChallenge, toastIfFail: true, },
    "login": { func: login, toastIfFail: true, },
    "createUser": { func: createUser, toastIfFail: true, },
    "askState": { func: askState, toastIfFail: true },
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
                    await handle.func(socket, JSON.parse(p))
                } catch (e) {
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

        socket.on("disconnect", () => {
            const userId = socketIdToUserId[socket.id]
            if (userId) {
                delete socketIdToUserId[socket.id];
                delete userIdToSocket[userId];
                if (lobby[userId].challenge) {
                    const [player1, player2] = [lobby[userId].challenge!.player1, lobby[userId].challenge!.player2]
                    delete lobby[player1].challenge
                    delete lobby[player2].challenge
                }
                updateLobby([userId]);
            }
        })
    });
})
