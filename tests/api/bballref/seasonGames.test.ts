import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { getSeasonGames, SeasonGameItem } from '../../../src/api/bballRef/seasons';

const SeasonGamesTest = suite('seasonGamesTest');
let testGames: SeasonGameItem[];
let testLeague: string;
let testYear: number;

SeasonGamesTest('getSeasonGames should be function', () => {
	assert.type(getSeasonGames, 'function');
});

SeasonGamesTest('get all seasonGames', async () => {
	const { games, league, year } = await getSeasonGames('NBA', 2021);
	testGames = games;
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

SeasonGamesTest.run();
