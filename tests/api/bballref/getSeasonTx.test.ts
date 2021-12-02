import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { League } from '../../../src/db/models/index';
import { LeagueDocument } from '../../../src/db/interfaces/mongoose.gen';
import { initConnect, endConnect } from '../../../src/db/connect';
import { getSeasonTx, SeasonTxList } from '../../../src/api/bballref/tx';

const GetSeasonTxTest = suite('getSeasonTxTest');
let league: LeagueDocument;
let seasonTxList: SeasonTxList;

GetSeasonTxTest.before(async () => {
	await initConnect();
});

GetSeasonTxTest.after(async () => {
	await endConnect();
});

GetSeasonTxTest('Load league: instance of LeagueDocument', async () => {
	league = await League.findOne({ name: 'NBA' });
	assert.instance(league, League);
});

GetSeasonTxTest('get seasonTxList: object', async () => {
	seasonTxList = await getSeasonTx(league.name, league.seasons[league.seasons.length - 1].year);
	assert.type(seasonTxList, 'object');
});

GetSeasonTxTest('print seasonTxList', () => {
	console.log(seasonTxList);
});

GetSeasonTxTest.run();
