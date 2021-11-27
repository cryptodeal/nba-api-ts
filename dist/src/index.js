"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = require("./db/init");
//import { Player2 } from './db/models/Player2';
const Game2_1 = require("./db/controllers/Game2");
(0, init_1.initConnect)().then(async () => {
    (0, Game2_1.importBoxScores)();
});
