import { CardStatus, Game, Player, UserCard, UserGame } from "../../common/src/game.interface";
import { powers } from "../../common/src/powers";
export declare const gameEngine: () => {
    state: {
        game: Game;
    };
    funcs: {
        newGame: (id: string, player1: string, player2: string) => void;
        loadGame: (loadedGame: Game) => void;
        getUserGame: (playerId: string) => UserGame;
        pickPower: (playerId: string, selectedPower: (keyof typeof powers)) => void;
        pickGreen: (playerId: string) => void;
        pickRandom: (playerId: string) => void;
        discard: (playerId: string, x: number, y: number) => void;
        knock: (playerId: string) => void;
        setReady: (playerId: string) => void;
        getPlayerById: (playerId: string) => Player;
        capitulate: (playerId: string) => void;
        getAllCard: () => {
            id: string;
            x: number;
            y: number;
            status: CardStatus;
            player1: UserCard;
            player2: UserCard;
            basePoints: number;
        }[];
        choose: (playerId: string, x: number, y: number) => void;
        evaluate: (player: Player) => void;
        getOpId: (id: string) => string;
    };
};
