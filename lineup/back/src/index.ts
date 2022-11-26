import express from "express"
import http from "http"
import { Server, Socket } from "socket.io"
import { MongoClient } from "mongodb"
import { ApiCAll, AskState, State } from "./common/api.interface"
import { DefaultEventsMap } from "socket.io/dist/typed-events"

const cors = require("cors")
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    // cors : {
    //     origin : "*",
    // }
    path: '/api',
});

const sendState = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, state: State) => {
    socket.emit("newState", JSON.stringify(state))
}

io.on('connection', (socket) => {
    console.log("USER CON");
    socket.emit("welcome", socket.id)

    socket.on("askState", (param: AskState) => {
        console.log("User ask for state", param.user);
        if (!param.user) {
            return sendState(socket, { connected: false })
        }
    })
});

server.listen({
    port: 3001,
    host: "0.0.0.0",
}, () => {
    console.log("SERVER STARTED");
});

// ; (async () => {
//     const client = new MongoClient(`mongodb://root:chien@mongo:27017`);
//     await client.connect();
//     const db = client.db("unbogame");
//     await db.createCollection("users", {}).catch(e => { });
//     await client.close();
//     console.log("SUCESS");
// })()