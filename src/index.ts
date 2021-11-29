import { initConnect } from './db/connect';
import { Game2 } from './db/models/Game2';
import { importBoxScores } from './db/controllers/Game2';

initConnect().then(async () => {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	for await (const game of Game2.findOne({
		'game.home.leaders.points.statValue': null,
		date: { $lte: yesterday }
	}).populate('home.team visitor.team')) {
		importBoxScores(game);
	}
});
