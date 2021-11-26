import { Game2 } from './db/models';
import { initConnect } from './db/init';
import { getBoxScore } from './api/bballRef/games';

initConnect()
	.then(async () => {
		const game = await Game2.findOne({
			'meta.helpers.bballRef.year': 2020
		}).populate('home.team visitor.team');
		if (game !== null) return getBoxScore(game);
	})
	.then((boxScore) => {
		console.log(boxScore);
	});
