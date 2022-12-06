import { ApiCallBase, AskState, CreateUser, Login, State } from "../../common/src/api.interface";
import { SSocket } from "./state";
export declare const disconnect: (socket: SSocket, param: ApiCallBase) => Promise<void>;
export declare const login: (socket: SSocket, param: Login) => Promise<void>;
export declare const sendStateToUser: (userId: string, state: State) => void;
export declare const askState: (socket: SSocket, param: AskState) => Promise<void>;
export declare const createUser: (socket: SSocket, param: CreateUser) => Promise<void>;
