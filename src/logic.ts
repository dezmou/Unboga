import { io, connect } from "socket.io-client"
import { render } from "./render";
import { global } from "./state"
import { ApiCAll, Call, Capitulate, ExitLobby, PlayChosse, PlayDiscard, PlayKnock, PlayPickGreen, PlayPickRandom, PlayReady, PlayPickPower, Revenge, State, ToastEvent } from "../common/src/api.interface"
import { powers } from "../common/src/powers";
import { Howl } from "howler";
import langage from "../common/src/langage";
import french from "../common/src/langage/french";
import { Game, UserGame } from "../common/src";

const socket = io(`${window.location.origin}`, {
    path: "/api",
    upgrade: false,
    transports: ['websocket'],
});

const apiCAll = (params: ApiCAll) => {
    socket.emit(params.action, JSON.stringify({
        ...params,
        user: global.localState.user
    }));
}

export const getLang = (id: keyof typeof french) => {
    return langage[global.localState.langage][id]
}

export const exitLobby = async () => {
    apiCAll({ action: "play", play: "exitLobby", } as ExitLobby)
}

export const revenge = async () => {
    apiCAll({ action: "play", play: "revenge", } as Revenge)
}

export const ready = async () => {
    global.localState.hideButtons = true;
    render("game")
    apiCAll({ action: "play", play: "ready", } as PlayReady)
}

export const knock = async () => {
    global.localState.hideButtons = true;
    render("game")
    apiCAll({ action: "play", play: "knock", } as PlayKnock)
}

export const capitulate = async () => {
    apiCAll({ action: "play", play: "capitulate", } as Capitulate)
}

export const choose = async (x: number, y: number) => {
    // const game = global.state.game!;
    // game.board[y][x].status.status = "deck";
    // game.pick = { x, y };
    // game.nextActionPlayer = game.nextActionPlayer === "player1" ? "player2" : "player1"
    // render("game")
    apiCAll({ action: "play", play: "choose", x, y } as PlayChosse)
}

export const discard = async (x: number, y: number) => {
    const game = global.state.game!;
    game.board[y][x].status.status = "deck";
    game.pick = { x, y };
    game.nextActionPlayer = game.nextActionPlayer === "player1" ? "player2" : "player1"
    render("game")
    apiCAll({ action: "play", play: "discard", x, y } as PlayDiscard)
}

export const pickgreen = async () => {
    global.localState.hideButtons = true;
    render("game")
    apiCAll({ action: "play", play: "pickGreen" } as PlayPickGreen)
}

export const pickRandom = async () => {
    global.localState.hideButtons = true;
    render("game")
    apiCAll({ action: "play", play: "pickRandom" } as PlayPickRandom)
}

export const pickPower = async (spowers: (keyof typeof powers)) => {
    global.state.game!.youStatus.powerReady = true;
    global.state.game!.youStatus.powers.push(spowers);
    render("game")
    apiCAll({ action: "play", play: "pickPower", powers: spowers } as PlayPickPower)
}


export const cancelChallenge = async () => {
    apiCAll({ action: "cancelChallenge" })
}

export const playBot = async () => {
    apiCAll({ action: "playBot" })
}

export const acceptChallenge = async () => {
    apiCAll({ action: "acceptChallenge" })
}

export const challenge = async (id: string) => {
    apiCAll({ action: "challenge", id })
}

export const login = (name: string, pass: string) => {
    apiCAll({ action: "login", name, password: pass })
}

export const createUser = (name: string, pass: string) => {
    apiCAll({ action: "createUser", name, password: pass })
}

const askState = () => {
    apiCAll({ action: "askState", user: global.localState.user })
}

const renderAll = (targets: string[]) => {
    for (let target of targets) {
        render(target);
    }
}

const watchLayout = async () => {
    const root = document.documentElement

    while (true) {
        const allWidth = window.innerWidth;
        const allHeight = window.innerHeight;

        if (global.localState.size.width !== allWidth || global.localState.size.height !== allHeight) {

            global.localState.size.width = allWidth;
            global.localState.size.height = allHeight;

            let width = allWidth;
            let height = allHeight;
            width = Math.min(allWidth, allHeight * 0.6);
            root.style.setProperty('--width', `${width}px`);
            root.style.setProperty('--height', `${height}px`);

            root.style.setProperty('--allWidth', `${allWidth}px`);
            root.style.setProperty('--allHeight', `${allHeight}px`);
        }
        await new Promise(r => setTimeout(r, 100));
    }
}

export const audios = {
    close: new Howl({ src: ['close.mp3'] }),
    choose: new Howl({ src: ['choose.mp3'] }),
    knock: new Howl({ src: ['knock.mp3'] }),
    pomp: new Howl({ src: ['pomp.mp3'] }),
    you: new Howl({ src: ['you.mp3'] }),
    fool: new Howl({ src: ['fool.mp3'], }),
    full: new Howl({ src: ['full.mp3'], }),
    shuffle: new Howl({ src: ['shuffle.mp3'], }),
}

export const main = async () => {
    const res = localStorage.getItem("lang");
    if (res) {
        global.localState.langage = res as "fr" | "en";
    }

    window.onbeforeunload = () => {
        console.log("UNLOAD");
        socket.close();
    }

    socket.on("welcome", (id) => {
        const user = localStorage.getItem("user");
        global.localState.user = user ? JSON.parse(user) : undefined
        askState();
        global.localState.welcomed = true;
        render("global");
    })

    socket.on("toast", (msg: string) => {
        const param = JSON.parse(msg) as ToastEvent
        toast({
            ...param,
            opened: true,
        })
    })

    socket.on("reload", () => {
        setTimeout(() => {
            window.location.reload()
        }, 1000)
    })

    socket.on("lobby", (msg: string) => {
        const lobby = JSON.parse(msg);
        global.lobby = lobby;
        render("lobby");
    })

    socket.on("connected", (msg: string) => {
        const params = JSON.parse(msg) as { id: string, token: string };
        global.localState.user = params;
        localStorage.setItem("user", JSON.stringify(params));
        askState();
    })

    socket.on("newState", (msg: string) => {
        global.state = JSON.parse(msg);
        console.log("STATE", global.state);
        global.localState.hideButtons = false;
        if (global.state.page === "login") {
            localStorage.removeItem("user");
        }
        global.localState.ready = true;
        if (global.state.consume) {
            for (let audio of global.state.consume.audios as (keyof typeof audios)[]) {
                audios[audio].play();
            }
        }
        renderAll(global.state.render)
    })
    watchLayout();
}

export const toast = (param: typeof global.localState.toast) => {
    global.localState.toast = param;
    render("toast");
}
