import { ObjectID } from "bson"
import { addGame, getUserState, updateUserState } from "./bdd"
import { gameEngine } from "./engine"

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
        })]
    )

    // for (let player of players) {
    //     ; (async () => {
    //         player!.page = "game"
    //     })()
    // }

}