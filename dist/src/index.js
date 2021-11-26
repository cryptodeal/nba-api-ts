"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./db/models");
const init_1 = require("./db/init");
//import { getBoxScore } from './api/bballRef/games';
const Player2_1 = require("./db/controllers/Player2");
(0, init_1.initConnect)().then(() => {
    return models_1.Player2.findOne()
        .exec()
        .then((player) => {
        if (player) {
            return (0, Player2_1.addPlayerBasicData)(player);
        }
        return;
    })
        .then(console.log);
});
