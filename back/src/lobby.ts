import { getUserState } from "./bdd";
import { ApiCallBase, Challenge, PlayBot, ToastEvent } from "./common/api.interface";
import { BOT_ID, newGame } from "./game";
import { io, lobby, SSocket, userIdToSocket } from "./state";

export const cancelChallenge = async (socket: SSocket, param: ApiCallBase) => {
    if (!lobby[param.user!.id] || !lobby[param.user!.id].challenge) return;
    if (lobby[param.user!.id].challenge!.initiator !== param.user!.id) {
        const op = userIdToSocket[lobby[param.user!.id].challenge!.player1];
        if (op) {
            op.emit("toast", JSON.stringify({
                color: "blue",
                msg: "Challenge declined",
                time: 2000,
            } as ToastEvent))
        }
    }
    const player1 = lobby[param.user!.id].challenge!.player1
    const player2 = lobby[param.user!.id].challenge!.player2
    lobby[player1].challenge = undefined;
    lobby[player2].challenge = undefined;
    updateLobby([])
}

export const acceptChallenge = async (socket: SSocket, param: ApiCallBase) => {
    if (!lobby[param.user!.id] || !lobby[param.user!.id].challenge) return;
    await newGame(lobby[param.user!.id].challenge!.player1, lobby[param.user!.id].challenge!.player2)

    const player1 = lobby[param.user!.id].challenge!.player1
    const player2 = lobby[param.user!.id].challenge!.player2
    if (lobby[player1]) {
        lobby[player1].challenge = undefined;
        lobby[player1].status = "inGame"
    }
    if (lobby[player2]) {
        lobby[player2].status = "inGame"
        lobby[player2].challenge = undefined;
    }
    updateLobby([])
}

export const playBot = async (socket: SSocket, param: PlayBot) => {
    await newGame(param.userId!, BOT_ID);
    if (lobby[param.userId!]) {
        lobby[param.userId!].status = "inGame"
        lobby[param.userId!].challenge = undefined;
    }
    updateLobby([])
}

export const challenge = async (socket: SSocket, param: Challenge) => {
    const [user, target] = await Promise.all([
        getUserState(param.user!.id),
        getUserState(param.id)
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
}

export const updateLobby = async (userIds: string[]) => {
    await Promise.all(userIds.map(userId => (async () => {
        if (!userIdToSocket[userId]) {
            if (lobby[userId]) {
                delete lobby[userId];
            }
        } else {
            const user = (await getUserState(userId))!;
            if (!lobby[userId]) {
                lobby[userId] = {
                    elo: user.user!.elo,
                    id: userId,
                    name: user.user!.name,
                    status: user.inGame ? "inGame" : "online"
                }
            } else {
                lobby[userId].status = user.inGame ? "inGame" : "online"
                lobby[userId].elo = user.user!.elo;
            }
        }
    })()));
    io.emit("lobby", JSON.stringify(lobby))
}