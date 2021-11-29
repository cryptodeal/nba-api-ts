import { test, suite } from 'uvu';
import * as assert from 'uvu/assert';
import { Game2 } from '../../src/db/models/index';
import { getBoxScore } from '../../src/api/bballRef/games';
import { initConnect, endConnect } from '../../src/db/connect';
import { BoxScore, BoxScorePlayer } from '../../src/api/bballRef/games/utils';
import { importBoxScores } from '../../src/db/controllers/Game2';
import { Game2Document } from '../../src/db/interfaces/mongoose.gen';

const BoxScoreTest = suite('boxScoreTest');
let game: any;
let boxScore: void | BoxScore;
let gameResult: Game2Document;

BoxScoreTest.before(async () => {
	await initConnect();
});

BoxScoreTest.after(async () => {
	await endConnect();
});

BoxScoreTest('importBoxScores should be function', () => {
	assert.type(importBoxScores, 'function');
});

BoxScoreTest('getBoxScore should be function', () => {
	assert.type(getBoxScore, 'function');
});

BoxScoreTest('find game in Game2 collection', async () => {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	game = await Game2.findOne({ date: { $lte: yesterday } }).populate('home.team visitor.team');
});

BoxScoreTest('find game in Game2 collection', async () => {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	game = await Game2.findOne({ date: { $lte: yesterday } }).populate('home.team visitor.team');
});

BoxScoreTest('game should be instance of Game2Document', () => {
	if (game) assert.instance(game, Game2);
});

BoxScoreTest('load boxScore for game', async () => {
	if (game) {
		boxScore = await getBoxScore(game);
	}
});

BoxScoreTest('gameData (boxscore data) should be instance of BoxScore class', async () => {
	if (boxScore) {
		assert.instance(boxScore, BoxScore);
	}
});

BoxScoreTest('each boxScore home player should be instance of BoxScorePlayer class', () => {
	boxScore?.home.players.map((p) => {
		assert.instance(p, BoxScorePlayer);
	});
});

BoxScoreTest('boxscore visitor player should be instance of BoxScorePlayer class', () => {
	boxScore?.visitor.players.map((p) => {
		assert.instance(p, BoxScorePlayer);
	});
});

BoxScoreTest.run();
