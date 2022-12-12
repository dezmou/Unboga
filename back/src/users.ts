import { addUser, getUserState, getUserByName } from "./bdd";
import { ApiCallBase, AskState, CreateUser, Login, State, ToastEvent } from "../../common/src/api.interface";
import { updateLobby } from "./lobby";
import { lobby, sendState, socketIdToUserId, SSocket, userIdToSockets } from "./state";

export const disconnect = async (socket: SSocket, param: ApiCallBase) => {
    console.log("DISCONNECT");
    const userId = socketIdToUserId[socket.id]
    if (userId) {
        delete socketIdToUserId[socket.id];
        if (userIdToSockets[userId]) {
            delete userIdToSockets[userId][socket.id]
            if (Object.keys(userIdToSockets[userId]).length === 0) {
                delete userIdToSockets[userId];
            }
        }
        if (lobby[userId].challenge) {
            const [player1, player2] = [lobby[userId].challenge!.player1, lobby[userId].challenge!.player2]
            delete lobby[player1].challenge
            delete lobby[player2].challenge
        }
        updateLobby([userId]);
    }
}

export const login = async (socket: SSocket, param: Login) => {
    const res = await getUserByName(param.name)
    if (!res || param.password !== res.password) {
        socket.emit("toast", JSON.stringify({
            color: "red",
            msg: "Wrong username or password",
            time: 4000,
        } as ToastEvent))
        return;
    }
    if (param.name.length > 10) {
        socket.emit("toast", JSON.stringify({
            color: "red",
            msg: "Username too long",
            time: 4000,
        } as ToastEvent))
        return;
    }
    socket.emit("connected", JSON.stringify({ id: res._id, token: res.token }))
}

export const sendStateToUser = (userId: string, state: State) => {
    if (!userIdToSockets[userId]) {
        return;
    }
    // for (const sock of Object.keys(userIdToSockets[userId])) {
    //     if (!userIdToSockets[userId][sock].connected) {
    //         delete userIdToSockets[userId][sock];
    //     }
    // }


    console.log();
    for (const sock of Object.values(userIdToSockets[userId])) {
        sendState(sock, state);
    }
    console.log();
}

export const askState = async (socket: SSocket, param: AskState) => {
    if (!param.user) {
        return sendState(socket, {
            page: "login",
            render: ["login"]
        })
    } else {
        const res = await getUserState(param.user.id)
        if (!res || res!.user!.token !== param.user.token) {
            return sendState(socket, {
                page: "login",
                render: ["login"]
            })
        } else {
            if (!userIdToSockets[param.user!.id]) {
                userIdToSockets[param.user!.id] = {};
            }
            if (!userIdToSockets[param.user!.id][socket.id]) {
                userIdToSockets[param.user!.id][socket.id] = socket;
            }
            socketIdToUserId[socket.id] = param.user!.id;
            updateLobby([param.user!.id]);

            // if (userIdToSockets[param])
            return sendStateToUser(param.user.id, res);
        }
    }
}

export const createUser = async (socket: SSocket, param: CreateUser) => {
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
}