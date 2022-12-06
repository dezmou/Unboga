import { ApiCallBase, Challenge, PlayBot } from "../../common/src/api.interface";
import { SSocket } from "./state";
export declare const cancelChallenge: (socket: SSocket, param: ApiCallBase) => Promise<void>;
export declare const acceptChallenge: (socket: SSocket, param: ApiCallBase) => Promise<void>;
export declare const playBot: (socket: SSocket, param: PlayBot) => Promise<void>;
export declare const challenge: (socket: SSocket, param: Challenge) => Promise<void>;
export declare const updateLobby: (userIds: string[]) => Promise<void>;
