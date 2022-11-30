import { addGame, getUser } from "./bdd"
import { gameEngine } from "./engine"

export const newGame = async (player1: string, player2: string) => {
    const players = await Promise.all([
        getUser(player1),
        getUser(player2),
    ])
    const game = gameEngine()
    game.funcs.newGame(player1, player2)
    await addGame(game.state.game!);

    // for (let player of players) {
    //     ; (async () => {
    //         player!.page = "game"
    //     })()
    // }

}