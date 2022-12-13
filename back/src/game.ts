import { ObjectID } from "bson"
import { addGame, getGame, getUserState, updateGame, updateUserState } from "./bdd"
import { Capitulate, Play, PlayChosse, PlayDiscard, PlayKnock, PlayPickGreen, PlayPickRandom, PlayPickPower, State } from "../../common/src/api.interface"
import { gameEngine } from "./engine"
import { playBot, updateLobby } from "./lobby"
import { addConsume, SSocket } from "./state"
import { sendStateToUser } from "./users"
import { powers } from "../../common/src/powers"
import { BOT_ID } from "../../common/src/game.interface"

const calculateElo = (myRating: number, opponentRating: number, myGameResult: number) => {

    const getRatingDelta = (myRating: number, opponentRating: number, myGameResult: number) => {
        var myChanceToWin = 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));
        return Math.round(32 * (myGameResult - myChanceToWin));
    }
    return myRating + getRatingDelta(myRating, opponentRating, myGameResult);
}

const botPlay = async (gameState: ReturnType<typeof gameEngine>) => {
    const game = gameState.state.game!;
    const func = gameState.funcs
    // await new Promise(r => setTimeout(r, Math.floor(Math.random() * 500)))

    if (game.nextAction === "pick") {
        const fork = gameEngine()
        fork.funcs.loadGame(JSON.parse(JSON.stringify(game)));
        fork.funcs.pickGreen(BOT_ID)
        const cards = func.getAllCard();
        const forkCards = fork.funcs.getAllCard();
        if (forkCards.filter(c => c.player2.inStreak).length > cards.filter(c => c.player2.inStreak).length) {
            func.pickGreen(BOT_ID);
        } else {
            func.pickRandom(BOT_ID);
        }
    } else if (game.nextAction === "discard") {
        const card = (() => {
            while (true) {
                const x = Math.floor(Math.random() * 8);
                const y = Math.floor(Math.random() * 8);
                if (game.board[y][x].status === "player2"
                    && !game.board[y][x].player2.inStreak
                ) {
                    return game.board[y][x];
                }
            }
        })()
        func.discard(BOT_ID, card.x, card.y)
    } else if (game.nextAction === "choose") {
        const choices = func.getAllCard().filter(c => c.player2.status === "deck")
        const choice = choices[Math.floor(Math.random() * choices.length)];
        func.choose("player2", choice.x, choice.y)
    }
    return true;
}

export const play = async (socket: SSocket, param: Play) => {
    const user = (await getUserState(param.userId!))!;
    const gameState = (await getGame(user.game!.id))!;
    const game = gameEngine()
    game.funcs.loadGame(gameState);

    if (param.play === "pickPower") {
        const p = param as PlayPickPower
        if (game.state.game.player1.powerReady || game.state.game.player2.powerReady) {
            for (const playerId of [game.state.game.player1Id, game.state.game.player2Id]) {
                addConsume(playerId, { audios: ["choose"] })
            }
        }
        game.funcs.pickPower(p.userId!, p.powers);
    } else if (param.play === "pickGreen") {
        const p = param as PlayPickGreen
        game.funcs.pickGreen(p.userId!)
        for (const playerId of [game.state.game.player1Id, game.state.game.player2Id]) {
            addConsume(playerId, { audios: ["pomp"] })
        }
    } else if (param.play === "choose") {
        const p = param as PlayChosse
        game.funcs.choose(p.userId!, p.x, p.y!)
    } else if (param.play === "pickRandom") {
        const p = param as PlayPickRandom
        game.funcs.pickRandom(p.userId!)
        for (const playerId of [game.state.game.player1Id, game.state.game.player2Id]) {
            addConsume(playerId, { audios: ["pomp"] })
        }
    } else if (param.play === "discard") {
        const p = param as PlayDiscard
        game.funcs.discard(p.userId!, p.x, p.y);
        addConsume(p.userId!, { audios: ["pomp"] })
        addConsume(game.funcs.getOpId(p.userId!), { audios: ["you"] })
    } else if (param.play === "knock") {
        const p = param as PlayKnock
        game.funcs.knock(p.userId!);
    } else if (param.play === "ready") {
        const p = param as PlayKnock
        game.funcs.setReady(p.userId!);
    } else if (param.play === "capitulate") {
        const p = param as Capitulate
        for (const playerId of [game.state.game.player1Id, game.state.game.player2Id]) {
            addConsume(playerId, { audios: ["close"] })
        }
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

    if (game.state.game.roundResult && !game.state.game.player1.ready && !game.state.game.player2.ready) {
        if (game.state.game.roundResult.reason === "knock_win") {
            addConsume(param.userId!, { audios: ["knock"] })
            addConsume(game.funcs.getOpId(param.userId!), { audios: ["knock"] })
        }
        if (game.state.game.roundResult.reason === "knock_lost") {
            addConsume(param.userId!, { audios: ["fool"] })
            addConsume(game.funcs.getOpId(param.userId!), { audios: ["fool"] })
        }
        if (game.state.game.roundResult.reason === "knock_full") {
            addConsume(param.userId!, { audios: ["full"] })
            addConsume(game.funcs.getOpId(param.userId!), { audios: ["full"] })
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

        let lobbyNeedUpdate = false;
        if (game.state.game!.gameResult) {
            if (!game.state.game!.misc.endGameProcessed) {
                const res = game.state.game!.gameResult
                const player1 = game.state.game!.player1Id === user.user!.id ? user : op;
                const player2 = game.state.game!.player1Id === user.user!.id ? op : user;
                if (res.winner === "player1") {
                    player1.user!.elo = calculateElo(player1.user!.elo, player2.user!.elo, 1);
                    player2.user!.elo = calculateElo(player2.user!.elo, player1.user!.elo, 0);
                } else if (res.winner === "player2") {
                    player1.user!.elo = calculateElo(player1.user!.elo, player2.user!.elo, 0);
                    player2.user!.elo = calculateElo(player2.user!.elo, player1.user!.elo, 1);
                } else if (res.winner === "draw") {
                    player1.user!.elo = calculateElo(player1.user!.elo, player2.user!.elo, 0.5);
                    player2.user!.elo = calculateElo(player2.user!.elo, player1.user!.elo, 0.5);
                }
                game.state.game!.misc.player1.elo = player1.user!.elo;
                game.state.game!.misc.player2.elo = player2.user!.elo;
                game.state.game!.misc.endGameProcessed = true;
                lobbyNeedUpdate = true
            }
        }

        await Promise.all([
            updateGame(game.state.game!),
            ...[user, op].map(async pState => updateUserGame(pState))]
        )
        if (lobbyNeedUpdate) {
            updateLobby([user.user!.id, op.user!.id])
        }
    } else {
        if (!game.state.game!.player2.ready) {
            game.funcs.setReady(BOT_ID);
        }
        if (!game.state.game!.player2.powerReady) {
            const pows = Object.keys(powers).filter((e) => {
                if (e === "unknow") {
                    return false;
                }
                if (game.state.game.player2.powers.filter(b => b === e).length >= (powers[e as keyof typeof powers]).max) {
                    return false
                }
                return true;
            }) as (keyof typeof powers)[]
            console.log(pows);
            game.funcs.pickPower(BOT_ID, pows[Math.floor(Math.random() * pows.length)]);
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
    game.state.game!.misc.player1 = { elo: p1State!.user!.elo, name: p1State!.user!.name, roundWon: 0 }
    game.state.game!.misc.player2 = { elo: p2State!.user!.elo, name: p2State!.user!.name, roundWon: 0 }
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