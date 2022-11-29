import express from "express"
import http from "http"
import { Server, Socket } from "socket.io"
import { ApiCAll, AskState, CreateUser, Login, State, ToastEvent } from "./common/api.interface"
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

const userIdToSocket: { [key: string]: SSocket } = {

}

const socketIdToUserId: { [key: string]: string } = {

}

onReady.subscribe(() => {
    io.on('connection', (socket) => {
        console.log("USER CON");
        socket.emit("welcome", socket.id)

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
                console.log(userIdToSocket);
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
                        console.log(userIdToSocket);
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
