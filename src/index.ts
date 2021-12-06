import { endConnect, initConnect } from './db/connect';
import { Game2, Team2 } from './db/models';
import { importBoxScores } from './db/controllers/Game2';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

initConnect()
	.then(async () => {
		const yesterday = new Date();
		let count = await Game2.countDocuments({
			date: { $lte: yesterday },
			officials: { $elemMatch: { official: { $exists: false } } }
		});
		yesterday.setDate(yesterday.getDate() - 1);
		for await (const game of Game2.find({
			date: { $lte: yesterday },
			'home.leaders.points.statValue': null
		}).populate('home.team visitor.team')) {
			console.log(count);
			await importBoxScores(game);
			count--;
		}
	})
	.then(endConnect)
	.then(() => console.log('Completed!'));
