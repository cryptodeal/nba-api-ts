import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { getSeasonGames } from '../../../src/api/bballRef/seasons';
import { Dayjs } from 'dayjs';

const SeasonGamesTest = suite('seasonGamesTest');
let testGames: (string | boolean | Dayjs)[][];
let testLeague: string;
let testYear: number;

SeasonGamesTest('getSeasonGames should be function', () => {
	assert.type(getSeasonGames, 'function');
});

SeasonGamesTest('get all seasonGames', async () => {
	const { allGames, league, year } = await getSeasonGames('NBA', 2021);
	testGames = allGames;
	testLeague = league;
	testYear = year;
});

SeasonGamesTest('testLeague should be string', () => {
	assert.type(testLeague, 'string');
});

SeasonGamesTest('testYear should be number', () => {
	assert.type(testYear, 'number');
});

SeasonGamesTest('testGames should be array', () => {
	assert.instance(testGames, Array);
});

SeasonGamesTest('each index of testGames should contain array of game basic info', () => {
	testGames.map((g) => {
		assert.instance(g, Array);
	});
});

SeasonGamesTest.run();
