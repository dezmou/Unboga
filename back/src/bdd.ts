import { MongoClient, ObjectId } from "mongodb"
import { State } from "../../common/src/api.interface";
import { BOT_ID, Game } from "../../common/src/game.interface";
import { Subject } from "rxjs"
import { config } from "dotenv"

config()
const client = new MongoClient(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongo:27017`);
let db: ReturnType<MongoClient["db"]>;

export const onReady = new Subject<boolean>()

export interface UserEntry {
    _id: ObjectId,
    name: string,
    password: string,
    token: string,
    state: State,
}

client.connect().then(async r => {
    db = client.db("unbogame");
    await Promise.all([
        db.createCollection("users", {}).catch(e => { }),
        db.createCollection("games", {}).catch(e => { }),
    ])
    const id = new ObjectId(BOT_ID) //bot

    const newState: State = {
        page: "lobby",
        render: ["global"],
        user: {
            id: id.toString(),
            elo: 1000,
            name: "bot",
            token: "bot_",
        }
    }
    const doc: UserEntry = {
        _id: id,
        name: "bot",
        password: "bot",
        token: "bot_",
        state: newState,
    }
    const res = await db.collection("users").insertOne(doc, {}).catch(e => { });

    onReady.next(true);
});

const makeId = () => {
    return Math.floor((1 + Math.random()) * 0x1000000000000000)
        .toString(32)
}

export const addUser = async (name: string, password: string) => {
    const existing = (await db.collection("users").findOne({ name })) as any;
    if (existing) {
        throw "USER_EXIST"
    }

    const token = makeId()
    const id = new ObjectId()
    const newState: State = {
        page: "lobby",
        render: ["global"],
        user: {
            id: id.toString(),
            elo: 1000,
            name: name,
            token: token,
        }
    }

    const doc: UserEntry = {
        _id: id,
        name,
        password,
        token,
        state: newState,
    }

    const res = await db.collection("users").insertOne(doc);
    return { id, token }
}

export const updateGame = async (game: Game) => {
    await db.collection("games").updateOne({ _id: new ObjectId(game.id) }, { $set: game });
}

export const addGame = async (game: Game) => {
    await db.collection("games").insertOne({ ...game, _id: new ObjectId(game.id) })
}

export const getGame = async (gameId: string) => {
    const res = (await db.collection("games").findOne({ _id: new ObjectId(gameId) }));
    return res as any as Game;
}

export const updateUserState = async (id: string, data: State) => {
    await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: { state: data } });
}

export const getUserState = async (id: string) => {
    const res = (await db.collection("users").findOne({ _id: new ObjectId(id) }));
    if (!res) {
        return;
    }
    return res.state as State;
}

export const getUserByName = async (name: string) => {
    const res = (await db.collection("users").findOne({ name })) as any;
    if (!res) {
        return;
    }
    return res as { state: State, name: string, password: string, token: string, _id: string };
}