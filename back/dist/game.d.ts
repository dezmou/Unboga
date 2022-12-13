import { Play } from "../../common/src/api.interface";
import { SSocket } from "./state";
export declare const play: (socket: SSocket, param: Play) => Promise<void>;
export declare const newGame: (player1: string, player2: string) => Promise<void>;
