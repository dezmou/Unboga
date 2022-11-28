import { MongoClient, ObjectId } from "mongodb"
import { State } from "./common/api.interface";
import { Subject } from "rxjs"

const client = new MongoClient(`mongodb://root:chien@mongo:27017`);
let db: ReturnType<MongoClient["db"]>;

export const onReady = new Subject<boolean>()

client.connect().then(async r => {
    db = client.db("unbogame");
    await db.createCollection("users", {}).catch(e => { });
    onReady.next(true);
});

const makeId = () => {
    return Math.floor((1 + Math.random()) * 0x1000000000000000)
        .toString(32)
}

export const addUser = async (name: string, password: string) => {
    console.log("add user", name, password);
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

export const getUser = async (id: string) => {
    console.log("FIND", id);
    const res = (await db.collection("users").findOne({ _id: new ObjectId(id) }));
    console.log("cringe", res);
    if (!res) {
        return;
    }
    return res.state as State;
}