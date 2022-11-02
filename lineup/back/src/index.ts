import express from "express"
import http from "http"
import { Server } from "socket.io"

const cors = require("cors")
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    // cors : {
    //     origin : "*",
    // }
    path: '/api'
});

// app.use(cors({
//     origin: (origin: any, callback: any) => {
//         callback(null, true)
//     },
//     credentials: true,
// }))

io.on('connection', (socket) => {
    console.log("USER CON");
    socket.emit("welcome", socket.id)
});

// app.get('/', (req, res) => {
//     res.send('<h1>Hello world</h1>');
// });

server.listen(3001, () => {
    console.log("SERVER STARTED");
});