import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Consume, LobbyEntry, State } from "../../common/src/api.interface";
export declare const sendState: (socket: SSocket, state: State) => void;
export declare type SSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
export declare const io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
export declare const lobby: {
    [key: string]: LobbyEntry;
};
export declare const userIdToSockets: {
    [key: string]: {
        [key: string]: SSocket;
    };
};
export declare const socketIdToUserId: {
    [key: string]: string;
};
export declare const consumeList: {
    [key: string]: Consume | undefined;
};
export declare const addConsume: (userId: string, con: Consume) => void;
