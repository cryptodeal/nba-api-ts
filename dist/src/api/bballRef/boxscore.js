"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBoxScorePage = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const cheerio_1 = __importDefault(require("cheerio"));
const loadBoxScorePage = (date, homeTeam, num) => {
    const url = num !== undefined
        ? `https://www.basketball-reference.com/boxscores/${date}${num}${homeTeam}.html`
        : `https://www.basketball-reference.com/boxscores/${date}0${homeTeam}.html`;
    return (0, cross_fetch_1.default)(url).then(async (result) => {
        const body = await result.text();
        return cheerio_1.default.load(body);
    });
};
exports.loadBoxScorePage = loadBoxScorePage;
