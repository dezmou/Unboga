"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const french_1 = __importDefault(require("./french"));
const english_1 = __importDefault(require("./english"));
exports.default = {
    fr: french_1.default,
    en: english_1.default,
};
