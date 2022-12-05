import { addUser, getUserState, getUserByName } from "./bdd";
import { ApiCallBase, AskState, CreateUser, Login, State, ToastEvent } from "./common/api.interface";
import { updateLobby } from "./lobby";
import { lobby, sendState, socketIdToUserId, SSocket, userIdToSocket } from "./state";

export const disconnect = async (socket: SSocket, param: ApiCallBase) => {
    console.log("DISCONNECT");
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
    if (param.name.length > 10){
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
    if (!userIdToSocket[userId]) {
        console.log(Object.keys(userIdToSocket));
        console.log("NOT FOUND", userId);
        return;
    }
    sendState(userIdToSocket[userId], state);
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
            if (!userIdToSocket[param.user!.id]) {
                userIdToSocket[param.user!.id] = socket;
                socketIdToUserId[socket.id] = param.user!.id;
                updateLobby([param.user!.id]);
            }
            return sendState(socket, res);
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