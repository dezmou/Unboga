"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByName = exports.getUser = exports.addGame = exports.addUser = exports.onReady = void 0;
const mongodb_1 = require("mongodb");
const rxjs_1 = require("rxjs");
const client = new mongodb_1.MongoClient(`mongodb://root:chien@mongo:27017`);
let db;
exports.onReady = new rxjs_1.Subject();
client.connect().then((r) => __awaiter(void 0, void 0, void 0, function* () {
    db = client.db("unbogame");
    yield Promise.all([
        db.createCollection("users", {}).catch(e => { }),
        db.createCollection("games", {}).catch(e => { }),
    ]);
    exports.onReady.next(true);
}));
const makeId = () => {
    return Math.floor((1 + Math.random()) * 0x1000000000000000)
        .toString(32);
};
const addUser = (name, password) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = (yield db.collection("users").findOne({ name }));
    if (existing) {
        throw "USER_EXIST";
    }
    const token = makeId();
    const newState = {
        page: "lobby",
        render: ["global"],
        user: {
            elo: 1000,
            name: name,
            token: token,
        }
    };
    const res = yield db.collection("users").insertOne({
        name,
        password,
        token,
        state: newState,
    });
    res.insertedId;
    console.log(res);
    return { id: res.insertedId, token };
});
exports.addUser = addUser;
const addGame = (game) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.collection("games").insertOne(Object.assign(Object.assign({}, game), { _id: new mongodb_1.ObjectId(game._id) }));
});
exports.addGame = addGame;
const getUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = (yield db.collection("users").findOne({ _id: new mongodb_1.ObjectId(id) }));
    if (!res) {
        return;
    }
    return res.state;
});
exports.getUser = getUser;
const getUserByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const res = (yield db.collection("users").findOne({ name }));
    if (!res) {
        return;
    }
    return res;
});
exports.getUserByName = getUserByName;