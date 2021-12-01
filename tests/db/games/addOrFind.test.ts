import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { getSeasonGames, SeasonGameItem } from '../../../src/api/bballRef/seasons';
import { addOrFindGame } from '../../../src/db/controllers/Game2';
import { initConnect, endConnect } from '../../../src/db/connect';

const AddOrFindGameTest = suite('addOrFindGameTest');
let games: SeasonGameItem[];
let game;
let year: number;

AddOrFindGameTest.before(async () => {
	await initConnect();
});

AddOrFindGameTest.after(async () => {
	await endConnect();
});

AddOrFindGameTest('test function exec', () => {
	assert.type(addOrFindGame, 'function');
});

AddOrFindGameTest('fetch list of games in 2020-21 NBA season', async () => {
	const { games, league, year } = await getSeasonGames('NBA', 2021);
	game = await addOrFindGame(games[0], year, league);
});

AddOrFindGameTest('fetch list of games in 2020-21 NBA season', () => {
	assert.ok(game);
});

AddOrFindGameTest.run();
