import { Player2 } from './db/models';
import { initConnect } from './db/init';
//import { getBoxScore } from './api/bballRef/games';
import { addPlayerBasicData } from './db/controllers/Player2';
import { Player2Document } from './interfaces/mongoose.gen';

initConnect().then(() => {
	return Player2.findOne()
		.exec()
		.then((player: Player2Document | null) => {
			if (player) {
				return addPlayerBasicData(player);
			}
			return;
		})
		.then(console.log);
});
