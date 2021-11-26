"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importBoxScores = void 0;
const models_1 = require("../../models");
const games_1 = require("../../../api/bballRef/games");
const importBoxScores = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    for await (const game of models_1.Game2.find({
        date: { $lte: yesterday },
        'home.leaders.points.statValue': undefined
    }).populate('home.team visitor.team')) {
        const boxScore = await (0, games_1.getBoxScore)(game);
        if (boxScore) {
            if (boxScore.arena)
                game.arena = boxScore.arena;
            if (boxScore.city)
                game.city = boxScore.city;
            if (boxScore.state)
                game.state = boxScore.state;
            if (boxScore.country)
                game.country = boxScore.country;
            if (boxScore.officials?.length) {
                boxScore.officials.map((o) => game.officials.addToSet({
                    officials: o._id
                }));
            }
            await game.save();
        }
    }
};
exports.importBoxScores = importBoxScores;
