import { Game2 } from './db/models';
import { Game2Document, IsPopulated } from './interfaces/mongoose.gen';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { initConnect } from './db/init';
import { getBoxScore } from './api/bballRef/game';

dayjs.extend(utc);
dayjs.extend(timezone);

const testHelper = (game: Game2Document) => {
	/** Find date for boxscore query */
	const date =
		game.time == false
			? dayjs(game?.date).format('YYYYMMDD')
			: dayjs(game?.date).tz('America/New_York').format('YYYYMMDD');
	if (IsPopulated(game.home.team) && IsPopulated(game.visitor.team)) {
		if (game.home.team?.seasons && game.visitor.team?.seasons) {
			const homeIndex = game.home.team.seasons.findIndex(
				(s) => s.season === game.meta.helpers.bballRef.year
			);
			const visitorIndex = game.visitor.team.seasons.findIndex(
				(s) => s.season === game.meta.helpers.bballRef.year
			);
			if (homeIndex > -1 && visitorIndex > -1) {
				const homeAbbrev = game.home.team.seasons[homeIndex].infoCommon.abbreviation;
				const visitorAbbrev = game.visitor.team.seasons[visitorIndex].infoCommon.abbreviation;
				if (visitorAbbrev && homeAbbrev) {
					return getBoxScore(date, homeAbbrev, visitorAbbrev);
				}
			}
		}
	}
};

initConnect()
	.then(async () => {
		const game = await Game2.findOne({
			'meta.helpers.bballRef.year': 2020
		}).populate('home.team visitor.team');
		if (game !== null) return testHelper(game);
	})
	.then(console.log);
