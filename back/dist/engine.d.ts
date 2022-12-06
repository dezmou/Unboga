import { Game, Player, UserGame } from "../../common/src/game.interface";
import { powers } from "../../common/src/powers";
export declare const gameEngine: () => {
    state: {
        game: Game | undefined;
    };
    funcs: {
        newGame: (id: string, player1: string, player2: string) => void;
        loadGame: (loadedGame: Game) => void;
        getUserGame: (playerId: string) => UserGame;
        selectPowers: (playerId: string, selectedPowers: (keyof typeof powers)[]) => void;
        pickGreen: (playerId: string) => void;
        pickRandom: (playerId: string) => void;
        discard: (playerId: string, x: number, y: number) => void;
        knock: (playerId: string) => void;
        setReady: (playerId: string) => void;
        getPlayerById: (playerId: string) => Player;
        capitulate: (playerId: string) => void;
    };
};
