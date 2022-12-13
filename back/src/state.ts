import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Consume, LobbyEntry, State } from "../../common/src/api.interface";
import { BOT_ID } from "../../common/src/game.interface";

const app = express();
const server = http.createServer(app);
server.listen({ port: 3001, host: "0.0.0.0", }, () => {
    console.log("SERVER STARTED");
});

export const sendState = (socket: SSocket, state: State) => {
    socket.emit("newState", JSON.stringify(state))
}

export type SSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

export const io = new Server(server, { path: '/api' });
export const lobby: { [key: string]: LobbyEntry } = {}
export const userIdToSockets: { [key: string]: { [key: string]: SSocket } } = {}
export const socketIdToUserId: { [key: string]: string } = {}
export const consumeList: { [key: string]: Consume | undefined } = {};

export const addConsume = (userId: string, con: Consume) => {
    if (userId === BOT_ID) return;
    if (!consumeList[userId]) {
        consumeList[userId] = con;
    } else {
        consumeList[userId] = {
            audios: [...(consumeList[userId]!).audios, ...con.audios]
        };
    }
}