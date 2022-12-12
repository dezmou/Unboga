import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { LobbyEntry, State } from "../../common/src/api.interface";

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
