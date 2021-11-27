import { initConnect } from './db/init';
import { Game2 } from './db/models/Game2';
import { importBoxScores } from './db/controllers/Game2';

initConnect().then(async () => {
	for await (const game of Game2.findOne({
		'game.home.leaders.points.statValue': null,
		date: { $lte: yesterday }
	}).populate('home.team visitor.team')) {
		importBoxScores(game);
	}
});
