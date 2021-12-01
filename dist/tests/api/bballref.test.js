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
const index_1 = require("../../src/db/models/index");
const index_2 = require("../../src/db/models/index");
const games_1 = require("../../src/api/bballRef/games");
const player_1 = require("../../src/api/bballRef/player");
const connect_1 = require("../../src/db/connect");
const utils_1 = require("../../src/api/bballRef/games/utils");
const Game2_1 = require("../../src/db/controllers/Game2");
const BoxScoreTest = (0, uvu_1.suite)('boxScoreTest');
let game;
let boxScore;
BoxScoreTest.before(async () => {
    await (0, connect_1.initConnect)();
});
BoxScoreTest.after(async () => {
    await (0, connect_1.endConnect)();
});
BoxScoreTest('importBoxScores should be function', () => {
    assert.type(Game2_1.importBoxScores, 'function');
});
BoxScoreTest('getBoxScore should be function', () => {
    assert.type(games_1.getBoxScore, 'function');
});
BoxScoreTest('find game in Game2 collection', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    game = await index_1.Game2.findOne({ date: { $lte: yesterday } }).populate('home.team visitor.team');
});
BoxScoreTest('find game in Game2 collection', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    game = await index_1.Game2.findOne({ date: { $lte: yesterday } }).populate('home.team visitor.team');
});
BoxScoreTest('game should be instance of Game2Document', () => {
    if (game)
        assert.instance(game, index_1.Game2);
});
BoxScoreTest('load boxScore for game', async () => {
    if (game) {
        boxScore = await (0, games_1.getBoxScore)(game);
    }
});
BoxScoreTest('gameData (boxscore data) should be instance of BoxScore class', async () => {
    if (boxScore) {
        assert.instance(boxScore, utils_1.BoxScore);
    }
});
BoxScoreTest('each boxScore home player should be instance of BoxScorePlayer class', () => {
    boxScore?.home.players.map((p) => {
        assert.instance(p, utils_1.BoxScorePlayer);
    });
});
BoxScoreTest('boxscore visitor player should be instance of BoxScorePlayer class', () => {
    boxScore?.visitor.players.map((p) => {
        assert.instance(p, utils_1.BoxScorePlayer);
    });
});
BoxScoreTest.run();
const PlayerMetaTest = (0, uvu_1.suite)('playerMetaTest');
let player;
let playerData;
PlayerMetaTest.before(async () => {
    await (0, connect_1.initConnect)();
});
PlayerMetaTest.after(async () => {
    await (0, connect_1.endConnect)();
});
PlayerMetaTest('find player in Player2 collection ', async () => {
    player = await index_2.Player2.findOne();
});
PlayerMetaTest('playerUrl should be string', async () => {
    const { playerUrl } = player.meta.helpers.bballRef;
    assert.type(playerUrl, 'string');
});
PlayerMetaTest('getPlayerData should be function', () => {
    assert.type(player_1.getPlayerData, 'function');
});
PlayerMetaTest('load player profile meta data', async () => {
    const { playerUrl } = player.meta.helpers.bballRef;
    playerData = await (0, player_1.getPlayerData)(playerUrl);
});
PlayerMetaTest('verify playerData exists', () => {
    assert.ok(playerData);
});
PlayerMetaTest.run();
