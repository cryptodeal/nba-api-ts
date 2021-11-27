import { Game2 } from '../../models';
import { getBoxScore } from '../../../api/bballRef/games';
import { Game2Document } from '../../interfaces/mongoose.gen';

export const importBoxScores = async (game: Game2Document) => {
	//const yesterday = new Date();
	//yesterday.setDate(yesterday.getDate() - 1);
	/*for await (const game of Game2.findOne({
		'game.home.leaders.points.statValue': null,
		date: { $lte: yesterday }
	}).populate('home.team visitor.team')) {*/
	const boxScore = await getBoxScore(game);
	const unpopulatedGame = await Game2.findById(game._id);
	if (boxScore && unpopulatedGame) {
		if (boxScore.arena) unpopulatedGame.arena = boxScore.arena;
		if (boxScore.city) unpopulatedGame.city = boxScore.city;
		if (boxScore.state) unpopulatedGame.state = boxScore.state;
		if (boxScore.country) unpopulatedGame.country = boxScore.country;
		if (boxScore.officials?.length) {
			boxScore.officials.map((o) =>
				unpopulatedGame.officials.addToSet({
					official: o._id
				})
			);
		}

		/** Code below this is a WIP */

		/** Set home boxscore data */
		if (boxScore.home) {
			/** Set home players */
			if (boxScore.home.players) {
				boxScore.home.players.map((p) => {
					const player = {
						player: p._id,
						active: p.active,
						inactive: p.inactive ? p.inactive : false,
						stats: p.stats ? p.stats : {}
					};
					unpopulatedGame.home.players.addToSet(player);
				});
			}

			/** Set home player stat leaders */
			if (boxScore.home.leaders) {
				const { leaders } = boxScore.home;
				if (leaders.points) {
					const { leader, statValue } = leaders.points;
					if (statValue) unpopulatedGame.home.leaders.points.statValue = statValue;
					if (leader) leader.map((l) => unpopulatedGame.home.leaders.points.leader.addToSet(l));
				}
				if (leaders.assists) {
					const { leader, statValue } = leaders.assists;
					if (statValue) unpopulatedGame.home.leaders.assists.statValue = statValue;
					if (leader) leader.map((l) => unpopulatedGame.home.leaders.assists.leader.addToSet(l));
				}
				if (leaders.rebounds) {
					const { leader, statValue } = leaders.rebounds;
					if (statValue) unpopulatedGame.home.leaders.rebounds.statValue = statValue;
					if (leader) leader.map((l) => unpopulatedGame.home.leaders.rebounds.leader.addToSet(l));
				}
			}

			/** Set home team stats (basic and advanced) */
			if (boxScore.home.stats) {
				const stats = boxScore.home.stats;
				const { totals, periods } = stats;
				const {
					fieldGoalsMade,
					fieldGoalsAttempted,
					fieldGoalsPct,
					threePointersMade,
					threePointersAttempted,
					threePointersPct,
					freeThrowsMade,
					freeThrowsAttempted,
					freeThrowsPct,
					offReb,
					defReb,
					totalReb,
					assists,
					steals,
					blocks,
					turnovers,
					personalFouls,
					points,
					advanced
				} = totals;
				if (advanced) unpopulatedGame.home.stats.totals.advanced = advanced;
				if (fieldGoalsMade) unpopulatedGame.home.stats.totals.fieldGoalsMade = fieldGoalsMade;
				if (fieldGoalsAttempted)
					unpopulatedGame.home.stats.totals.fieldGoalsAttempted = fieldGoalsAttempted;
				if (fieldGoalsPct) unpopulatedGame.home.stats.totals.fieldGoalsPct = fieldGoalsPct;
				if (threePointersMade)
					unpopulatedGame.home.stats.totals.threePointersMade = threePointersMade;
				if (threePointersAttempted)
					unpopulatedGame.home.stats.totals.threePointersAttempted = threePointersAttempted;
				if (threePointersPct) unpopulatedGame.home.stats.totals.threePointersPct = threePointersPct;
				if (freeThrowsMade) unpopulatedGame.home.stats.totals.freeThrowsMade = freeThrowsMade;
				if (freeThrowsAttempted)
					unpopulatedGame.home.stats.totals.freeThrowsAttempted = freeThrowsAttempted;
				if (freeThrowsPct) unpopulatedGame.home.stats.totals.freeThrowsPct = freeThrowsPct;
				if (offReb) unpopulatedGame.home.stats.totals.offReb = offReb;
				if (defReb) unpopulatedGame.home.stats.totals.defReb = defReb;
				if (totalReb) unpopulatedGame.home.stats.totals.totalReb = totalReb;
				if (assists) unpopulatedGame.home.stats.totals.assists = assists;
				if (steals) unpopulatedGame.home.stats.totals.steals = steals;
				if (blocks) unpopulatedGame.home.stats.totals.blocks = blocks;
				if (turnovers) unpopulatedGame.home.stats.totals.turnovers = turnovers;
				if (personalFouls) unpopulatedGame.home.stats.totals.personalFouls = personalFouls;
				if (points) unpopulatedGame.home.stats.totals.points = points;

				/** If stats per period exists, add to home stats */
				if (periods) {
					periods.map((p) => {
						const {
							periodValue,
							periodName,
							fieldGoalsMade,
							fieldGoalsAttempted,
							fieldGoalsPct,
							threePointersMade,
							threePointersAttempted,
							threePointersPct,
							freeThrowsMade,
							freeThrowsAttempted,
							freeThrowsPct,
							offReb,
							defReb,
							totalReb,
							assists,
							steals,
							blocks,
							turnovers,
							personalFouls,
							points
						} = p;
						const periodStats = {
							periodValue,
							periodName,
							fieldGoalsMade,
							fieldGoalsAttempted,
							fieldGoalsPct,
							threePointersMade,
							threePointersAttempted,
							threePointersPct,
							freeThrowsMade,
							freeThrowsAttempted,
							freeThrowsPct,
							offReb,
							defReb,
							totalReb,
							assists,
							steals,
							blocks,
							turnovers,
							personalFouls,
							points
						};
						unpopulatedGame.home.stats.periods.addToSet(periodStats);
					});
				}
			}
		}

		/** Set visitor boxscore data */
		if (boxScore.visitor) {
			/** Set visitor players */
			if (boxScore.visitor.players) {
				boxScore.visitor.players.map((p) => {
					const player = {
						player: p._id,
						active: p.active,
						inactive: p.inactive ? p.inactive : false,
						stats: p.stats ? p.stats : {}
					};
					unpopulatedGame.visitor.players.addToSet(player);
				});
			}

			/** Set visitor player stat leaders */
			if (boxScore.visitor.leaders) {
				const { leaders } = boxScore.visitor;
				if (leaders.points) {
					const { leader, statValue } = leaders.points;
					if (statValue) unpopulatedGame.visitor.leaders.points.statValue = statValue;
					if (leader) leader.map((l) => unpopulatedGame.visitor.leaders.points.leader.addToSet(l));
				}
				if (leaders.assists) {
					const { leader, statValue } = leaders.assists;
					if (statValue) unpopulatedGame.visitor.leaders.assists.statValue = statValue;
					if (leader) leader.map((l) => unpopulatedGame.visitor.leaders.assists.leader.addToSet(l));
				}
				if (leaders.rebounds) {
					const { leader, statValue } = leaders.rebounds;
					if (statValue) unpopulatedGame.visitor.leaders.rebounds.statValue = statValue;
					if (leader)
						leader.map((l) => unpopulatedGame.visitor.leaders.rebounds.leader.addToSet(l));
				}
			}

			/** Set visitor team stats (basic and advanced) */
			if (boxScore.visitor.stats) {
				const stats = boxScore.visitor.stats;
				const { totals, periods } = stats;
				const {
					fieldGoalsMade,
					fieldGoalsAttempted,
					fieldGoalsPct,
					threePointersMade,
					threePointersAttempted,
					threePointersPct,
					freeThrowsMade,
					freeThrowsAttempted,
					freeThrowsPct,
					offReb,
					defReb,
					totalReb,
					assists,
					steals,
					blocks,
					turnovers,
					personalFouls,
					points,
					advanced
				} = totals;
				if (advanced) unpopulatedGame.visitor.stats.totals.advanced = advanced;
				if (fieldGoalsMade) unpopulatedGame.visitor.stats.totals.fieldGoalsMade = fieldGoalsMade;
				if (fieldGoalsAttempted)
					unpopulatedGame.visitor.stats.totals.fieldGoalsAttempted = fieldGoalsAttempted;
				if (fieldGoalsPct) unpopulatedGame.visitor.stats.totals.fieldGoalsPct = fieldGoalsPct;
				if (threePointersMade)
					unpopulatedGame.visitor.stats.totals.threePointersMade = threePointersMade;
				if (threePointersAttempted)
					unpopulatedGame.visitor.stats.totals.threePointersAttempted = threePointersAttempted;
				if (threePointersPct)
					unpopulatedGame.visitor.stats.totals.threePointersPct = threePointersPct;
				if (freeThrowsMade) unpopulatedGame.visitor.stats.totals.freeThrowsMade = freeThrowsMade;
				if (freeThrowsAttempted)
					unpopulatedGame.visitor.stats.totals.freeThrowsAttempted = freeThrowsAttempted;
				if (freeThrowsPct) unpopulatedGame.visitor.stats.totals.freeThrowsPct = freeThrowsPct;
				if (offReb) unpopulatedGame.visitor.stats.totals.offReb = offReb;
				if (defReb) unpopulatedGame.visitor.stats.totals.defReb = defReb;
				if (totalReb) unpopulatedGame.visitor.stats.totals.totalReb = totalReb;
				if (assists) unpopulatedGame.visitor.stats.totals.assists = assists;
				if (steals) unpopulatedGame.visitor.stats.totals.steals = steals;
				if (blocks) unpopulatedGame.visitor.stats.totals.blocks = blocks;
				if (turnovers) unpopulatedGame.visitor.stats.totals.turnovers = turnovers;
				if (personalFouls) unpopulatedGame.visitor.stats.totals.personalFouls = personalFouls;
				if (points) unpopulatedGame.visitor.stats.totals.points = points;

				/** If stats per period exists, add to visitor stats */
				if (periods) {
					periods.map((p) => {
						const {
							periodValue,
							periodName,
							fieldGoalsMade,
							fieldGoalsAttempted,
							fieldGoalsPct,
							threePointersMade,
							threePointersAttempted,
							threePointersPct,
							freeThrowsMade,
							freeThrowsAttempted,
							freeThrowsPct,
							offReb,
							defReb,
							totalReb,
							assists,
							steals,
							blocks,
							turnovers,
							personalFouls,
							points
						} = p;
						const periodStats = {
							periodValue,
							periodName,
							fieldGoalsMade,
							fieldGoalsAttempted,
							fieldGoalsPct,
							threePointersMade,
							threePointersAttempted,
							threePointersPct,
							freeThrowsMade,
							freeThrowsAttempted,
							freeThrowsPct,
							offReb,
							defReb,
							totalReb,
							assists,
							steals,
							blocks,
							turnovers,
							personalFouls,
							points
						};
						unpopulatedGame.visitor.stats.periods.addToSet(periodStats);
					});
				}
			}
		}
		return unpopulatedGame.save();
	}
	return null;
};
