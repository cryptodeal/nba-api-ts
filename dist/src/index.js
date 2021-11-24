"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./db/models");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const init_1 = require("./db/init");
const game_1 = require("./api/bballRef/game");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
(0, init_1.initConnect)()
    .then(async () => {
    const game = await models_1.Game2.findOne({
        'meta.helpers.bballRef.year': 2020
    }).populate('home.team visitor.team');
    if (game !== null)
        return (0, game_1.getBoxScore)(game);
})
    .then(console.log);
