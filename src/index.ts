import { Game2 } from './db/models';
import { Game2Document, IsPopulated } from './interfaces/mongoose.gen';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { initConnect } from './db/init';
import { getBoxScore } from './api/bballRef/game';

dayjs.extend(utc);
dayjs.extend(timezone);

initConnect()
	.then(async () => {
		const game = await Game2.findOne({
			'meta.helpers.bballRef.year': 2020
		}).populate('home.team visitor.team');
		if (game !== null) return getBoxScore(game);
	})
	.then(console.log);
