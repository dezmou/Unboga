import { MongoClient, ObjectId } from "mongodb"
import { State } from "./common/api.interface";
import { Subject } from "rxjs"
import { Game } from "./engine";

const client = new MongoClient(`mongodb://root:chien@mongo:27017`);
let db: ReturnType<MongoClient["db"]>;

export const onReady = new Subject<boolean>()

client.connect().then(async r => {
    db = client.db("unbogame");
    await Promise.all([
        db.createCollection("users", {}).catch(e => { }),
        db.createCollection("games", {}).catch(e => { }),
    ])
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
    const newState: State = {
        page: "lobby",
        render: ["global"],
        user: {
            elo: 1000,
            name: name,
            token: token,
        }
    }
    const res = await db.collection("users").insertOne({
        name,
        password,
        token,
        state: newState,
    })
    res.insertedId
    console.log(res);
    return { id: res.insertedId, token }
}
export const addGame = async (game: Game) => {
    await db.collection("games").insertOne({ ...game, _id: new ObjectId(game.id) })
}

export const getUser = async (id: string) => {
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