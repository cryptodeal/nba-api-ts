import { Game2 } from '../../models';
import { getBoxScore } from '../../../api/bballRef/games';

export const importBoxScores = async () => {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	for await (const game of Game2.find({
		date: { $lte: yesterday },
		'home.leaders.points.statValue': undefined
	}).populate('home.team visitor.team')) {
		const boxScore = await getBoxScore(game);
		if (boxScore) {
			if (boxScore.arena) game.arena = boxScore.arena;
			if (boxScore.city) game.city = boxScore.city;
			if (boxScore.state) game.state = boxScore.state;
			if (boxScore.country) game.country = boxScore.country;
			if (boxScore.officials?.length) {
				boxScore.officials.map((o) =>
					game.officials.addToSet({
						officials: o._id
					})
				);
			}
			await game.save();
		}
	}
};
