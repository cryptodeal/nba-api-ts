"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connect_1 = require("./db/connect");
const Game2_1 = require("./db/models/Game2");
const Game2_2 = require("./db/controllers/Game2");
(0, connect_1.initConnect)().then(async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    for await (const game of Game2_1.Game2.find({
        'home.leaders.points.statValue': null,
        date: { $lte: yesterday }
    }).populate('home.team visitor.team')) {
        await (0, Game2_2.importBoxScores)(game);
    }
})
    .then(connect_1.endConnect)
    .then(() => console.log('Completed!'));
