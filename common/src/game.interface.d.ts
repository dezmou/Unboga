import { powers } from "./powers";
declare type Modify<T, R> = Omit<T, keyof R> & R;
export declare const BOARD_SIZE = 8;
export declare const INITIAL_CARD_AMOUNT = 12;
export declare const MIN_TO_KNOCK = 30;
export declare const FULL_POINTS = 30;
export declare const SANCTION_POINTS = 30;
export declare const START_GOLD = 150;
export declare const MAX_POWER_NUMBER = 3;
export declare type CardStatus = "deck" | "player1" | "player2" | "lost";
export declare type UserCard = {
    status: CardStatus;
    villainRefused: boolean;
    points: number;
    inStreak: boolean;
    hori: boolean;
    verti: boolean;
    diagPos: boolean;
    diagNeg: boolean;
};
export declare type PlayerStatus = {
    gold: number;
    goldPublic: number;
    powers: (keyof typeof powers)[];
    powerReady: boolean;
    points: number;
    ready: boolean;
};
export declare type OpStatus = Modify<PlayerStatus, {
    powers?: (keyof typeof powers)[];
    points?: number;
}>;
export declare type Player = "player1" | "player2";
export declare type Game = {
    id: string;
    roundId: string;
    player1Id: string;
    player2Id: string;
    nextAction: "selectHero" | "pick" | "discard" | "choose";
    nextActionPlayer: Player;
    pick?: {
        x: number;
        y: number;
    };
    justPicked?: {
        x: number;
        y: number;
    };
    player1: PlayerStatus;
    player2: PlayerStatus;
    choose: {
        player1: {
            choosed: boolean;
            x: number;
            y: number;
        };
        player2: {
            choosed: boolean;
            x: number;
            y: number;
        };
        done: boolean;
    }[];
    chooseIndex: number;
    roundResult?: {
        knocker: Player;
        winner: Player;
        pointsWin: number;
        reason: "knock_win" | "knock_lost" | "knock_full";
    };
    gameResult?: {
        winner: Player | "draw";
        reason: "win" | "capitulate";
        revenge: {
            player1: "ask" | "yes" | "no";
            player2: "ask" | "yes" | "no";
        };
    };
    board: {
        id: string;
        x: number;
        y: number;
        status: CardStatus;
        player1: UserCard;
        player2: UserCard;
        basePoints: number;
    }[][];
    misc: {
        player1: {
            name: string;
            elo: number;
            roundWon: number;
        };
        player2: {
            name: string;
            elo: number;
            roundWon: number;
        };
        endGameProcessed: boolean;
    };
    pickHeroTurn: number;
};
export declare type UserGame = Modify<Game, {
    you: Player;
    villain: Player;
    board: {
        id: string;
        x: number;
        y: number;
        status: UserCard;
        points: number;
        player1: undefined;
        player2: undefined;
    }[][];
    canKnock: boolean;
    player1: undefined;
    player2: undefined;
    youStatus: PlayerStatus;
    opStatus: OpStatus;
    infos: {
        line1: string;
        line2: string;
    };
}>;
export {};
//# sourceMappingURL=game.interface.d.ts.map