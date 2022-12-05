import { ObjectID } from "bson"
import { addGame, getGame, getUserState, updateGame, updateUserState } from "./bdd"
import { Capitulate, Play, PlayDiscard, PlayKnock, PlayPickGreen, PlayPickRandom, PlaySelectPowers, State } from "./common/api.interface"
import { gameEngine } from "./engine"
import { playBot, updateLobby } from "./lobby"
import { SSocket } from "./state"
import { sendStateToUser } from "./users"

export const BOT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";

const botPlay = async (gameState: ReturnType<typeof gameEngine>) => {
    const game = gameState.state.game!;
    const func = gameState.funcs
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 500)))

    if (game.nextAction === "pick") {
        if (Math.random() > 0.33) {
            func.pickRandom("bot");
        } else {
            func.pickGreen("bot");
        }
    } else {
        const card = (() => {
            while (true) {
                const x = Math.floor(Math.random() * 8);
                const y = Math.floor(Math.random() * 8);
                if (game.board[y][x].status === "player2") {
                    return game.board[y][x];
                }
            }
        })()
        func.discard("bot", card.x, card.y)
    }
    return true;
}

export const play = async (socket: SSocket, param: Play) => {
    const user = (await getUserState(param.userId!))!;
    const gameState = (await getGame(user.game!.id))!;
    const game = gameEngine()
    game.funcs.loadGame(gameState);

    if (param.play === "selectPower") {
        const p = param as PlaySelectPowers
        game.funcs.selectPowers(p.userId!, p.powers);
    } else if (param.play === "pickGreen") {
        const p = param as PlayPickGreen
        game.funcs.pickGreen(p.userId!)
    } else if (param.play === "pickRandom") {
        const p = param as PlayPickRandom
        game.funcs.pickRandom(p.userId!)
    } else if (param.play === "discard") {
        const p = param as PlayDiscard
        game.funcs.discard(p.userId!, p.x, p.y);
    } else if (param.play === "knock") {
        const p = param as PlayKnock
        game.funcs.knock(p.userId!);
    } else if (param.play === "ready") {
        const p = param as PlayKnock
        game.funcs.setReady(p.userId!);
    } else if (param.play === "capitulate") {
        const p = param as Capitulate
        game.funcs.capitulate(p.userId!);
    } else if (param.play === "exitLobby") {
        user.inGame = undefined;
        user.game = undefined;
        user.page = "lobby";
        user.render = ["global"];
        game.state.game!.gameResult!.revenge[game.funcs.getPlayerById(param.userId!)] = "no"
    } else if (param.play === "revenge") {
        game.state.game!.gameResult!.revenge[game.funcs.getPlayerById(param.userId!)] = "yes"
        if (
            game.state.game!.gameResult!.revenge.player1 === "yes"
            && game.state.game!.gameResult!.revenge.player2 === "yes"
        ) {
            await newGame(game.state.game!.player1Id, game.state.game!.player2Id);
            return;
        }
    }

    const updateUserGame = async (state: State) => {
        if (state.inGame) {
            const userGame = game.funcs.getUserGame(state!.user!.id);
            state!.game = userGame;
            state!.render = ["game"]
        }
        await updateUserState(state!.user!.id, state!);
        if (!state.inGame) {
            updateLobby([state.user!.id])
        }
        sendStateToUser(state!.user!.id, state!);
    }

    if (game.state.game!.player2Id !== BOT_ID) {
        const op = ((await getUserState(gameState.player1Id === param.userId! ? gameState.player2Id : gameState.player1Id)))!
        await Promise.all([
            updateGame(game.state.game!),
            ...[user, op].map(async pState => updateUserGame(pState))]
        )
    } else {
        if (!game.state.game!.player2.ready) {
            game.funcs.setReady(BOT_ID);
        }
        if (!game.state.game!.player2.powerReady) {
            game.funcs.selectPowers(BOT_ID, [])
        }
        if (game.state.game!.gameResult) {
            game.state.game!.gameResult.revenge.player2 = "yes";
        }
        await Promise.all([updateUserGame(user), updateGame(game.state.game!)]);
        while (game.state.game!.nextActionPlayer === "player2"
            && game.state.game!.player1.ready
            && game.state.game!.player1.powerReady
            && !game.state.game!.gameResult
        ) {
            await botPlay(game);
            await Promise.all([updateUserGame(user), updateGame(game.state.game!)]);
        }
    }

}

export const newGame = async (player1: string, player2: string) => {
    const [p1State, p2State] = await Promise.all([
        getUserState(player1),
        getUserState(player2),
    ])
    const game = gameEngine()
    const id = new ObjectID()
    game.funcs.newGame(id.toString(), player1, player2)
    await Promise.all([
        addGame(game.state.game!),
        ...(player2 !== BOT_ID ? [p1State, p2State] : [p1State]).map(async pState => {
            pState!.inGame = game.state.game!.id
            const userGame = game.funcs.getUserGame(pState!.user!.id);
            pState!.game = userGame;
            pState!.page = "game"
            pState!.render = ["global"]
            await updateUserState(pState!.user!.id, pState!);
            sendStateToUser(pState!.user!.id, pState!);
        })]
    )
}