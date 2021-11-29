"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const uvu_1 = require("uvu");
const assert = __importStar(require("uvu/assert"));
const index_1 = require("../src/db/models/index");
const games_1 = require("../src/api/bballRef/games");
const init_1 = require("../src/db/init");
const utils_1 = require("../src/api/bballRef/games/utils");
const Game2_1 = require("../src/db/controllers/Game2");
(0, uvu_1.test)('getBoxScore()', async () => {
    assert.type(init_1.initConnect, 'function');
    await (0, init_1.initConnect)();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const game = await index_1.Game2.findOne({ date: { $lte: yesterday } }).populate('home.team visitor.team');
    assert.type(Game2_1.importBoxScores, 'function');
    if (game) {
        const boxScore = await (0, games_1.getBoxScore)(game);
        assert.instance(boxScore, utils_1.BoxScore);
        if (boxScore && boxScore.home)
            assert.instance(boxScore.home.players[0], utils_1.BoxScorePlayer);
        const resultGame = await (0, Game2_1.importBoxScores)(game);
        assert.type(resultGame, 'object');
    }
});
uvu_1.test.run();
