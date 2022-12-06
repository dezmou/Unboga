import { ObjectId } from "mongodb";
import { State } from "../../common/src/api.interface";
import { Game } from "../../common/src/game.interface";
import { Subject } from "rxjs";
export declare const onReady: Subject<boolean>;
export interface UserEntry {
    _id: ObjectId;
    name: string;
    password: string;
    token: string;
    state: State;
}
export declare const addUser: (name: string, password: string) => Promise<{
    id: ObjectId;
    token: string;
}>;
export declare const updateGame: (game: Game) => Promise<void>;
export declare const addGame: (game: Game) => Promise<void>;
export declare const getGame: (gameId: string) => Promise<Game>;
export declare const updateUserState: (id: string, data: State) => Promise<void>;
export declare const getUserState: (id: string) => Promise<State | undefined>;
export declare const getUserByName: (name: string) => Promise<{
    state: State;
    name: string;
    password: string;
    token: string;
    _id: string;
} | undefined>;
