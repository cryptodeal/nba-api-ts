"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./db/models");
const init_1 = require("./db/init");
const games_1 = require("./api/bballRef/games");
(0, init_1.initConnect)()
    .then(async () => {
    const game = await models_1.Game2.findOne({
        'meta.helpers.bballRef.year': 2020
    }).populate('home.team visitor.team');
    if (game !== null)
        return (0, games_1.getBoxScore)(game);
})
    .then((boxScore) => {
    console.log(boxScore?.home?.players);
});
