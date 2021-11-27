import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Game2 } from '../src/db/models/Game2';
import { getBoxScore } from '../src/api/bballRef/games';
import { initConnect } from '../src/db/init';
import { BoxScore, BoxScorePlayer } from '../src/api/bballRef/games/utils';
import { importBoxScores } from '../src/db/controllers/Game2';

test('getBoxScore()', async () => {
	assert.type(initConnect, 'function');
	await initConnect();
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const game = await Game2.findOne({ date: { $lte: yesterday } }).populate(
		'home.team visitor.team'
	);
	assert.type(importBoxScores, 'function');
	if (game) {
		const boxScore = await getBoxScore(game);
		assert.instance(boxScore, BoxScore);
		if (boxScore && boxScore.home) assert.instance(boxScore.home.players[0], BoxScorePlayer);
		const resultGame = await importBoxScores(game);
		assert.type(resultGame, 'object');
	}
});

test.run();
