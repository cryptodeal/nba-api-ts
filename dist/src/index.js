"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./db/init");
const Game2_1 = require("./db/controllers/Game2");
(0, init_1.initConnect)()
    .then(async () => {
    return (0, Game2_1.importBoxScores)();
})
    .then(console.log);
