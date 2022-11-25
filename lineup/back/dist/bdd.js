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
exports.setItem = exports.deleteItem = exports.getItem = void 0;
const fs_1 = require("fs");
const cache = {};
const getItem = (id) => {
    if (cache[id])
        return cache[id];
    return new Promise((r, j) => {
        (0, fs_1.readFile)(`./bdd/${id}`, "utf-8", (err, data) => {
            try {
                if (err) {
                    j(err);
                }
                else {
                    r(JSON.parse(data));
                }
            }
            catch (e) {
                j(e);
            }
        });
    });
};
exports.getItem = getItem;
const deleteItem = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise((r, j) => {
        (0, fs_1.unlink)(`./bdd/${id}`, (err) => {
            if (err) {
                j(err);
            }
            else {
                r();
            }
        });
    });
    delete cache[id];
});
exports.deleteItem = deleteItem;
const setItem = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    cache[id] = data;
    yield new Promise((r, j) => {
        try {
            (0, fs_1.writeFile)(`./bdd/${id}`, JSON.stringify(data, null, 2), "utf-8", (err) => {
                if (err) {
                    j(err);
                }
                else {
                    r();
                }
            });
        }
        catch (e) {
            j(e);
        }
    });
});
exports.setItem = setItem;
