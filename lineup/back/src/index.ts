import express from "express"
import http from "http"
import { Server, Socket } from "socket.io"
import { ApiCAll, AskState, Challenge, CreateUser, LobbyEntry, Login, State, ToastEvent } from "./common/api.interface"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import { addUser, getUser, getUserByName, onReady } from "./bdd"

const cors = require("cors")
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    // cors : {
    //     origin : "*",
    // }
    path: '/api',
});

type SSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

const sendState = (socket: SSocket, state: State) => {
    socket.emit("newState", JSON.stringify(state))
}

const lobby: { [key: string]: LobbyEntry } = {}

const userIdToSocket: { [key: string]: SSocket } = {}
const socketIdToUserId: { [key: string]: string } = {}

const updateLobby = async (userIds: string[]) => {
    await Promise.all(userIds.map(userId => (async () => {
        if (!userIdToSocket[userId]) {
            if (lobby[userId]) {
                delete lobby[userId];
            }
        } else {
            if (!lobby[userId]) {
                const user = (await getUser(userId))!;
                lobby[userId] = {
                    elo: user.user!.elo,
                    id: userId,
                    name: user.user!.name,
                    status: user.inGame ? "inGame" : "online"
                }
            }
        }
    })()));
    io.emit("lobby", JSON.stringify(lobby))
}

onReady.subscribe(() => {
    io.on('connection', (socket) => {
        console.log("USER CON");
        socket.emit("welcome", socket.id)

        socket.on("challenge", async (p) => {
            const param = JSON.parse(p) as Challenge
            const [user, target] = await Promise.all([
                getUser(param.user!.id),
                getUser(param.id)
            ])
            if (!user!.inGame
                && !target!.inGame
                && userIdToSocket[param.id]
                && userIdToSocket[param.user!.id]
                && (lobby[param.id] && lobby[param.id].status === "online")
                && (lobby[param.user!.id] && lobby[param.user!.id].status === "online")
                && !lobby[param.id].challenge
                && !lobby[param.user!.id].challenge
            ) {
                lobby[param.id].challenge = { player1: param.user!.id, player2: param.id, initiator: param.user!.id }
                lobby[param.user!.id].challenge = { player1: param.user!.id, player2: param.id, initiator: param.user!.id }
                updateLobby([param.id, param.user!.id])
            } else {
                socket.emit("toast", JSON.stringify({
                    color: "red",
                    msg: "Impossible to challenge user",
                    time: 4000,
                } as ToastEvent))
            }
        })

        socket.on("login", async (p) => {
            const param = JSON.parse(p) as Login
            const res = await getUserByName(param.name)
            if (!res || param.password !== res.password) {
                socket.emit("toast", JSON.stringify({
                    color: "red",
                    msg: "Wrong username or password",
                    time: 4000,
                } as ToastEvent))
                return;
            }
            socket.emit("connected", JSON.stringify({ id: res._id, token: res.token }))
        })

        socket.on("createUser", async (p) => {
            const param = JSON.parse(p) as CreateUser
            try {
                const user = await addUser(param.name, param.password);
                socket.emit("connected", JSON.stringify({ id: user.id, token: user.token }))
            } catch (e) {
                if (e === "USER_EXIST") {
                    socket.emit("toast", JSON.stringify({
                        color: "red",
                        msg: "User name exist Already",
                        time: 4000,
                    } as ToastEvent))
                    return;
                }
            }
        })

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
                console.log("ROEIGJOIRJGOIPRJGOP", userId);
                updateLobby([userId]);
            }
        })

        socket.on("askState", async (p: string) => {
            const param = JSON.parse(p) as AskState
            if (!param.user) {
                return sendState(socket, {
                    page: "login",
                    render: ["login"]
                })
            } else {
                const res = await getUser(param.user.id)
                if (!res || res!.user!.token !== param.user.token) {
                    return sendState(socket, {
                        page: "login",
                        render: ["login"]
                    })
                } else {
                    if (!userIdToSocket[param.user!.id]) {
                        userIdToSocket[param.user!.id] = socket;
                        socketIdToUserId[socket.id] = param.user!.id;
                        updateLobby([param.user!.id]);
                    }
                    return sendState(socket, res);
                }
            }
        })
    });

    server.listen({
        port: 3001,
        host: "0.0.0.0",
    }, () => {
        console.log("SERVER STARTED");
    });
})
