import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { Player2 } from '../../../src/db/models';
import { Player2Document } from '../../../src/db/interfaces/mongoose.gen';
import { getPlayerData, PlayerMetaData } from '../../../src/api/bballRef/player';
import { initConnect, endConnect } from '../../../src/db/connect';

const PlayerMetaTest = suite('playerMetaTest');
let player: Player2Document;
let playerData: PlayerMetaData;

PlayerMetaTest.before(async () => {
	await initConnect();
});

PlayerMetaTest.after(async () => {
	await endConnect();
});

PlayerMetaTest('find player in Player2 collection ', async () => {
	player = await Player2.findOne();
});

PlayerMetaTest('playerUrl should be string', async () => {
	const { playerUrl } = player.meta.helpers.bballRef;
	assert.type(playerUrl, 'string');
});

PlayerMetaTest('getPlayerData should be function', () => {
	assert.type(getPlayerData, 'function');
});

PlayerMetaTest('load player profile meta data', async () => {
	const { playerUrl } = player.meta.helpers.bballRef;
	playerData = await getPlayerData(playerUrl);
});

PlayerMetaTest('verify playerData exists', () => {
	assert.ok(playerData);
});

PlayerMetaTest.run();
