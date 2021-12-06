"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connect_1 = require("./db/connect");
const models_1 = require("./db/models");
const Game2_1 = require("./db/controllers/Game2");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
(0, connect_1.initConnect)()
    .then(async () => {
    const yesterday = new Date();
    let count = await models_1.Game2.countDocuments({
        date: { $lte: yesterday },
        officials: { $elemMatch: { official: { $exists: false } } }
    });
    yesterday.setDate(yesterday.getDate() - 1);
    for await (const game of models_1.Game2.find({
        date: { $lte: yesterday },
        'home.leaders.points.statValue': null
    }).populate('home.team visitor.team')) {
        console.log(count);
        await (0, Game2_1.importBoxScores)(game);
        count--;
    }
})
    .then(connect_1.endConnect)
    .then(() => console.log('Completed!'));
