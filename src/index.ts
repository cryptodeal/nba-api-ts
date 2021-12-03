import { endConnect, initConnect } from './db/connect';
import { Game2 } from './db/models';
import { importBoxScores } from './db/controllers/Game2';

initConnect()
	.then(async () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		for await (const game of Game2.find({
			'home.leaders.points.statValue': null,
			date: { $lte: yesterday }
		}).populate('home.team visitor.team')) {
			await importBoxScores(game);
		}
	})
	.then(endConnect)
	.then(() => console.log('Completed!'));
