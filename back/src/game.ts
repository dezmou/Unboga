import { ObjectID } from "bson"
import { addGame, getGame, getUserState, updateGame, updateUserState } from "./bdd"
import { Capitulate, Play, PlayDiscard, PlayKnock, PlayPickGreen, PlayPickRandom, PlaySelectPowers } from "./common/api.interface"
import { gameEngine } from "./engine"
import { updateLobby } from "./lobby"
import { SSocket } from "./state"
import { sendStateToUser } from "./users"

export const capitulate = async (socket: SSocket, param: Capitulate) => {
    const game = await getGame(param.gameId);
    await Promise.all([game.player1Id, game.player2Id].map(async (playerId) => {
        const state = (await getUserState(playerId))!;
        state.game = undefined;
        state.inGame = undefined;
        state.page = "lobby"
        await updateUserState(playerId, state);
        sendStateToUser(playerId, state);
    }))
    updateLobby([game.player1Id, game.player2Id]);
}

const botPlay = async (gameState: ReturnType<typeof gameEngine>) => {
    const game = gameState.state.game!;
    const func = gameState.funcs
    if (game.nextActionPlayer !== "player2") return;

    if (game.nextAction === "pick") {
        if (Math.random() > 0.2) {
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
    }

    if (game.state.game!.player2Id !== "bot") {
        const op = ((await getUserState(gameState.player1Id === param.userId! ? gameState.player2Id : gameState.player1Id)))!
        await Promise.all([
            updateGame(game.state.game!),
            ...[user, op].map(async pState => {
                const userGame = game.funcs.getUserGame(pState!.user!.id);
                pState!.game = userGame;
                pState!.render = ["game"]
                await updateUserState(pState!.user!.id, pState!);
                sendStateToUser(pState!.user!.id, pState!);
            })]
        )
    } else {
        await Promise.all([
            updateGame(game.state.game!),
            ...[user].map(async pState => {
                const userGame = game.funcs.getUserGame(pState!.user!.id);
                pState!.game = userGame;
                pState!.render = ["game"]
                await updateUserState(pState!.user!.id, pState!);
                sendStateToUser(pState!.user!.id, pState!);
            })]
        )

        botPlay(game);
        await new Promise(r => setTimeout(r, 300));
        await Promise.all([
            updateGame(game.state.game!),
            ...[user].map(async pState => {
                const userGame = game.funcs.getUserGame(pState!.user!.id);
                pState!.game = userGame;
                pState!.render = ["game"]
                await updateUserState(pState!.user!.id, pState!);
                sendStateToUser(pState!.user!.id, pState!);
            })]
        )

        botPlay(game);
        await new Promise(r => setTimeout(r, 300));
        await Promise.all([
            updateGame(game.state.game!),
            ...[user].map(async pState => {
                const userGame = game.funcs.getUserGame(pState!.user!.id);
                pState!.game = userGame;
                pState!.render = ["game"]
                await updateUserState(pState!.user!.id, pState!);
                sendStateToUser(pState!.user!.id, pState!);
            })]
        )
    }
}

export const newGameBot = async (player: string) => {
    const pState = await getUserState(player);
    const game = gameEngine()
    const id = new ObjectID()
    game.funcs.newGame(id.toString(), player, "bot")
    game.state.game!["player2"].powerReady = true;
    game.state.game!["player2"].powers = [];
    await Promise.all([
        addGame(game.state.game!),
        (async () => {
            pState!.inGame = game.state.game!.id
            const userGame = game.funcs.getUserGame(pState!.user!.id);
            console.log(userGame);
            pState!.game = userGame;
            pState!.page = "game"
            pState!.render = ["global"]
            await updateUserState(pState!.user!.id, pState!);
            sendStateToUser(pState!.user!.id, pState!);
        })()
    ])
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
        ...[p1State, p2State].map(async pState => {
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