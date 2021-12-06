import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { initConnect, endConnect } from '../../../src/db/connect';
import { Player2 } from '../../../src/db/models';
import { Player2Document } from '../../../src/db/interfaces/mongoose.gen';
import { storePlayerImage } from '../../../src/api/nba/images';

const PlayerImageTest = suite('playerImageTest');
let player: Player2Document;

PlayerImageTest.before(async () => {
	await initConnect();
});

PlayerImageTest.after(async () => {
	await endConnect();
});

PlayerImageTest('find player2: instance of Player2', async () => {
	player = await Player2.findOne({ 'meta.helpers.nbaPlayerId': '1505' });
	assert.instance(player, Player2);
});

PlayerImageTest('storePlayerImage: function', () => {
	assert.type(storePlayerImage, 'function');
});

PlayerImageTest('test storing player image', async () => {
	await storePlayerImage(player);
});

//PlayerImageTest.run();
