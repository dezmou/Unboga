import { io, connect } from "socket.io-client"
import { render } from "./render";
import { global } from "./state"
import { ApiCAll, Call, State } from "../back/src/common/api.interface"

const socket = io(`${window.location.origin}`, {
    path: "/api",
    upgrade: false,
    transports: ['websocket'],
});

export const isLoggued = () => { }

const apiCAll = (params: ApiCAll) => {
    socket.emit(params.action, JSON.stringify({
        ...params,
        user: global.localState.user
    }));
}

const askState = () => {
    apiCAll({ action: "askState" })
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
            const ratio = allHeight / allWidth
            width = Math.min(allWidth, allWidth * ratio * 0.7) ;
            root.style.setProperty('--width', `${width}px`);
            root.style.setProperty('--height', `${height}px`);
        }
        await new Promise(r => setTimeout(r, 100));
    }
}

const main = async () => {
    socket.on("welcome", (id) => {
        const user = localStorage.getItem("user");
        global.localState.user = user ? JSON.parse(user) : undefined
        askState();
        global.localState.welcomed = true;
        render("global");
    })

    socket.on("newState", (msg: string) => {
        global.state = JSON.parse(msg);
        global.localState.ready = true;
        renderAll(global.state.render)
    })
    watchLayout();
}

main();