import { getUser } from "./bdd"

export const newGame = async (player1: string, player2: string) => {
    const players = await Promise.all([
        getUser(player1),
        getUser(player2),
    ])
    for (let player of players) {
        ; (async () => {
            player!.page = "game"
        })()
    }

}