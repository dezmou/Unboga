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
exports.getUserByName = exports.getUserState = exports.updateUserState = exports.getGame = exports.addGame = exports.updateGame = exports.addUser = exports.onReady = void 0;
const mongodb_1 = require("mongodb");
const game_interface_1 = require("../../common/src/game.interface");
const rxjs_1 = require("rxjs");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const client = new mongodb_1.MongoClient(`mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongo:27017`);
let db;
exports.onReady = new rxjs_1.Subject();
client.connect().then((r) => __awaiter(void 0, void 0, void 0, function* () {
    db = client.db("unbogame");
    yield Promise.all([
        db.createCollection("users", {}).catch(e => { }),
        db.createCollection("games", {}).catch(e => { }),
    ]);
    const id = new mongodb_1.ObjectId(game_interface_1.BOT_ID); //bot
    const newState = {
        page: "lobby",
        render: ["global"],
        user: {
            id: id.toString(),
            elo: 1000,
            name: "bot",
            token: "bot_",
        }
    };
    const doc = {
        _id: id,
        name: "bot",
        password: "bot",
        token: "bot_",
        state: newState,
    };
    const res = yield db.collection("users").insertOne(doc, {}).catch(e => { });
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
    const id = new mongodb_1.ObjectId();
    const newState = {
        page: "lobby",
        render: ["global"],
        user: {
            id: id.toString(),
            elo: 1000,
            name: name,
            token: token,
        }
    };
    const doc = {
        _id: id,
        name,
        password,
        token,
        state: newState,
    };
    const res = yield db.collection("users").insertOne(doc);
    return { id, token };
});
exports.addUser = addUser;
const updateGame = (game) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.collection("games").updateOne({ _id: new mongodb_1.ObjectId(game.id) }, { $set: game });
});
exports.updateGame = updateGame;
const addGame = (game) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.collection("games").insertOne(Object.assign(Object.assign({}, game), { _id: new mongodb_1.ObjectId(game.id) }));
});
exports.addGame = addGame;
const getGame = (gameId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = (yield db.collection("games").findOne({ _id: new mongodb_1.ObjectId(gameId) }));
    return res;
});
exports.getGame = getGame;
const updateUserState = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield db.collection("users").updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { state: data } });
});
exports.updateUserState = updateUserState;
const getUserState = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = (yield db.collection("users").findOne({ _id: new mongodb_1.ObjectId(id) }));
    if (!res) {
        return;
    }
    return res.state;
});
exports.getUserState = getUserState;
const getUserByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    const res = (yield db.collection("users").findOne({ name }));
    if (!res) {
        return;
    }
    return res;
});
exports.getUserByName = getUserByName;
