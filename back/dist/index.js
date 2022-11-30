"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bdd_1 = require("./bdd");
const lobby_1 = require("./lobby");
const state_1 = require("./state");
const users_1 = require("./users");
const handles = {
    "challenge": { func: lobby_1.challenge, toastIfFail: true, },
    "acceptChallenge": { func: lobby_1.acceptChallenge, toastIfFail: true, },
    "cancelChallenge": { func: lobby_1.cancelChallenge, toastIfFail: true, },
    "login": { func: users_1.login, toastIfFail: true, },
    "createUser": { func: users_1.createUser, toastIfFail: true, },
    "askState": { func: users_1.askState, toastIfFail: true },
    "disconnect": { func: users_1.disconnect, toastIfFail: false },
};
bdd_1.onReady.subscribe(() => {
    state_1.io.on('connection', (socket) => {
        console.log("USER CON");
        socket.emit("welcome", socket.id);
        for (let api of Object.entries(handles)) {
            const action = api[0];
            const handle = api[1];
            socket.on(action, (p) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    let params = p;
                    try {
                        params = JSON.parse(p);
                    }
                    catch (e) { }
                    yield handle.func(socket, params);
                }
                catch (e) {
                    console.log(e);
                    if (handle.toastIfFail) {
                        try {
                            socket.emit("toast", JSON.stringify({
                                color: "red",
                                msg: "Oops something went wrong",
                                time: 4000,
                            }));
                        }
                        catch (e) { }
                    }
                }
            }));
        }
    });
});
