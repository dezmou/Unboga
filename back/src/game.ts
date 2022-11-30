import { ObjectID } from "bson"
import { addGame, getGame, getUserState, updateUserState } from "./bdd"
import { Capitulate } from "./common/api.interface"
import { gameEngine } from "./engine"
import { SSocket } from "./state"
import { sendStateToUser } from "./users"

export const capitulate = async (socket: SSocket, param: Capitulate) => {
    console.log("CAPITULATE", param);
    const game = await getGame(param.gameId);
    await Promise.all([game.player1Id, game.player2Id].map(async (playerId) => {
        const state = (await getUserState(playerId))!;
        state.game = undefined;
        state.inGame = undefined;
        state.page = "lobby"
        await updateUserState(playerId, state);
        sendStateToUser(playerId, state);
    }))
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
            p1State!.render = ["global"]
            await updateUserState(pState!.user!.id, pState!);
            sendStateToUser(pState!.user!.id, pState!);
        })]
    )

    // for (let player of players) {
    //     ; (async () => {
    //         player!.page = "game"
    //     })()
    // }

}