import { io, connect } from "socket.io-client"
import { render } from "./render";
import { global } from "./state"
import { ApiCAll, Call, PlayDiscard, PlayKnock, PlayPickGreen, PlayPickRandom, PlayReady, PlaySelectPowers, State, ToastEvent } from "../back/src/common/api.interface"
import { powers } from "./Game/powers";

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

export const ready = async () => {
    apiCAll({ action: "play", play: "ready", } as PlayReady)
}

export const knock = async () => {
    apiCAll({ action: "play", play: "knock", } as PlayKnock)
}

export const discard = async (x: number, y: number) => {
    apiCAll({ action: "play", play: "discard", x, y } as PlayDiscard)
}

export const pickgreen = async () => {
    apiCAll({ action: "play", play: "pickGreen" } as PlayPickGreen)
}

export const pickRandom = async () => {
    apiCAll({ action: "play", play: "pickRandom" } as PlayPickRandom)
}

export const selectPowers = async (spowers: (keyof typeof powers)[]) => {
    apiCAll({ action: "play", play: "selectPower", powers: spowers } as PlaySelectPowers)
}

export const capitulate = async () => {
    apiCAll({ action: "capitulate", gameId: global.state.game!.id })
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
            // const ratio = allHeight / allWidth
            width = Math.min(allWidth, allHeight * 0.6);
            root.style.setProperty('--width', `${width}px`);
            root.style.setProperty('--height', `${height}px`);

            root.style.setProperty('--allWidth', `${allWidth}px`);
            root.style.setProperty('--allHeight', `${allHeight}px`);
        }
        await new Promise(r => setTimeout(r, 100));
    }
}

export const main = async () => {

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
        if (global.state.page === "login") {
            localStorage.removeItem("user");
        }
        global.localState.ready = true;
        renderAll(global.state.render)
    })
    watchLayout();
}

export const toast = (param: typeof global.localState.toast) => {
    global.localState.toast = param;
    render("toast");
}
