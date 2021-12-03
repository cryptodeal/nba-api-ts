import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { Game2 } from '../../../src/db/models';
import { Game2Document } from '../../../src/db/interfaces/mongoose.gen';
import { getBoxScore } from '../../../src/api/bballRef/games';
import { initConnect, endConnect } from '../../../src/db/connect';
import { BoxScore, BoxScorePlayer } from '../../../src/api/bballRef/games/utils';

const BoxScoreTest = suite('boxScoreTest');
let game: Game2Document;
let boxScore: void | BoxScore;

BoxScoreTest.before(async () => {
	await initConnect();
});

BoxScoreTest.after(async () => {
	await endConnect();
});

BoxScoreTest('getBoxScore should be function', () => {
	assert.type(getBoxScore, 'function');
});

BoxScoreTest('find Game2: instance of Game2', async () => {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	game = await Game2.findOne({ date: { $lte: yesterday } }).populate('home.team visitor.team');
	assert.instance(game, Game2);
});

BoxScoreTest('load boxScore: instance of BoxScore', async () => {
	boxScore = await getBoxScore(game);
	assert.instance(boxScore, BoxScore);
});

BoxScoreTest('each boxScore home player: instance of BoxScorePlayer', () => {
	if (boxScore) {
		boxScore.home.players.map((p) => {
			assert.instance(p, BoxScorePlayer);
		});
	}
});

BoxScoreTest('each boxScore visitor player: instance of BoxScorePlayer', () => {
	if (boxScore) {
		boxScore.visitor.players.map((p) => {
			assert.instance(p, BoxScorePlayer);
		});
	}
});

BoxScoreTest.run();
