import { FourFactorData, BoxScoreData, ParsedOfficial } from './boxScore';
import { addOrFindPlayer } from '../../../db/controllers/Player2';
import { addOrFindOfficial } from '../../../db/controllers/Official2';
import { Types } from 'mongoose';

interface InactivePlayer {
	name: string;
	url: string;
}

interface TeamStatAdv {
	trueShootingPct?: number;
	effectiveFieldGoalPct?: number;
	threePointAttemptRate?: number;
	freeThrowAttemptRate?: number;
	offRebPct?: number;
	defRebPct?: number;
	totalRebPct?: number;
	assistPct?: number;
	stealPct?: number;
	blockPct?: number;
	turnoverPct?: number;
	offRating?: number;
	defRating?: number;
	pace?: number;
	ftPerFga?: number;
}

interface TeamStatTotals {
	fieldGoalsMade?: number;
	fieldGoalsAttempted?: number;
	fieldGoalsPct?: number;
	threePointersMade?: number;
	threePointersAttempted?: number;
	threePointersPct?: number;
	freeThrowsMade?: number;
	freeThrowsAttempted?: number;
	freeThrowsPct?: number;
	offReb?: number;
	defReb?: number;
	totalReb?: number;
	assists?: number;
	steals?: number;
	blocks?: number;
	turnovers?: number;
	personalFouls?: number;
	points?: number;
	advanced?: TeamStatAdv;
}

interface TeamStatPeriod {
	periodValue: number;
	periodName: string;
	fieldGoalsMade?: number;
	fieldGoalsAttempted?: number;
	fieldGoalsPct?: number;
	threePointersMade?: number;
	threePointersAttempted?: number;
	threePointersPct?: number;
	freeThrowsMade?: number;
	freeThrowsAttempted?: number;
	freeThrowsPct?: number;
	offReb?: number;
	defReb?: number;
	totalReb?: number;
	assists?: number;
	steals?: number;
	blocks?: number;
	turnovers?: number;
	personalFouls?: number;
	points?: number;
}

interface TeamStats {
	totals: TeamStatTotals;
	periods: TeamStatPeriod[];
}

interface StatLeaders {
	statValue: number;
	leader: Types.ObjectId[];
}

interface BoxScoreTeam2 {
	stats: TeamStats;
	players: BoxScorePlayer[];
	leaders: {
		points: StatLeaders;
		assists: StatLeaders;
		rebounds: StatLeaders;
	};
}

interface PlayerMeta {
	helpers: {
		bballRef: {
			playerUrl: string;
		};
	};
}

interface BoxScorePlayerPeriodStats {
	minutes?: number;
	seconds?: number;
	fieldGoalsMade?: number;
	fieldGoalsAttempted?: number;
	fieldGoalsPct?: number;
	threePointersMade?: number;
	threePointersAttempted?: number;
	threePointersPct?: number;
	freeThrowsMade?: number;
	freeThrowsAttempted?: number;
	freeThrowsPct?: number;
	offReb?: number;
	defReb?: number;
	totalReb?: number;
	assists?: number;
	steals?: number;
	blocks?: number;
	turnovers?: number;
	personalFouls?: number;
	points?: number;
	plusMinus?: number;
}

interface BoxScorePlayerPeriod {
	periodValue: number;
	periodName: string;
	active: boolean;
	stats: BoxScorePlayerPeriodStats;
}

interface BoxScorePlayerAdv {
	trueShootingPct?: number;
	effectiveFieldGoalPct?: number;
	threePointAttemptRate?: number;
	freeThrowAttemptRate?: number;
	offRebPct?: number;
	defRebPct?: number;
	totalRebPct?: number;
	assistPct?: number;
	stealPct?: number;
	blockPct?: number;
	turnoverPct?: number;
	usagePct?: number;
	offRating?: number;
	defRating?: number;
	boxPlusMinus?: number;
}

interface BoxScorePlayerBasic {
	minutes?: number;
	seconds?: number;
	fieldGoalsMade?: number;
	fieldGoalsAttempted?: number;
	fieldGoalsPct?: number;
	threePointersMade?: number;
	threePointersAttempted?: number;
	threePointersPct?: number;
	freeThrowsMade?: number;
	freeThrowsAttempted?: number;
	freeThrowsPct?: number;
	offReb?: number;
	defReb?: number;
	totalReb?: number;
	assists?: number;
	steals?: number;
	blocks?: number;
	turnovers?: number;
	personalFouls?: number;
	points?: number;
	plusMinus?: number;
	advanced?: BoxScorePlayerAdv;
}

interface BoxScorePlayerStats {
	totals: BoxScorePlayerBasic;
	periods: BoxScorePlayerPeriod[];
}

interface BoxScorePlayerGameData {
	active: boolean;
	stats?: BoxScorePlayerStats;
}

export class BoxScorePlayer {
	public fullName: string;
	public meta: PlayerMeta;
	public active: boolean;
	public isStarter = false;
	public stats;
	public inactive = false;
	public _id?: Types.ObjectId;

	constructor(
		basicData: Array<[string[], ...Array<string>]> | InactivePlayer,
		advancedData?: string[],
		index?: number,
		periods?: string[]
	) {
		if (Array.isArray(basicData)) {
			if (advancedData !== undefined && index !== undefined && periods !== undefined) {
				const gameBasic = basicData[0];
				this.fullName = gameBasic[0][0];
				this.meta = {
					helpers: {
						bballRef: {
							playerUrl: gameBasic[0][1]
						}
					}
				};
				if (gameBasic.length > 2) {
					this.isStarter = index < 5 ? true : false;
					//set basic stat totals
					const { active, stats } = this.setBasicStats(gameBasic);
					this.active = active;
					this.stats = stats;

					//set gameTotal advanced stats
					if (this.stats !== undefined) {
						if (advancedData && this.stats !== undefined)
							this.stats.totals.advanced = this.setAdvancedStats(advancedData);

						//set basic stats for all periods in game
						this.stats.periods = [];
						for (let i = 1; i < periods.length; i++) {
							if (basicData[i]) {
								const period = this.setPeriodStats(basicData[i], i, periods[i]);
								period.periodValue = i;
								period.periodName = periods[i];
								this.stats.periods.push(period);
							}
						}
					}
				} else {
					this.active = false;
					this.isStarter = false;
				}
			} else {
				throw Error('Invalid data for BoxScorePlayer');
			}
		} else {
			this.active = false;
			this.fullName = basicData.name;
			this.inactive = true;
			this.meta = {
				helpers: {
					bballRef: {
						playerUrl: basicData.url
					}
				}
			};
		}
	}
	set id(val) {
		this._id = val;
	}

	get id() {
		return this._id;
	}

	private setAdvancedStats(advancedData: string[]): BoxScorePlayerAdv {
		const advStats: BoxScorePlayerAdv = {};
		if (advancedData.length > 16) {
			const [
				,
				,
				tsPct,
				efgPct,
				tpaRate,
				ftaRate,
				orbPct,
				drbPct,
				trbPct,
				astPct,
				stlPct,
				blkPct,
				tovPct,
				usgPct,
				oRtg,
				dRtg,
				bpm
			] = advancedData;
			if (tsPct !== '') advStats.trueShootingPct = parseFloat(tsPct);
			if (efgPct !== '') advStats.effectiveFieldGoalPct = parseFloat(efgPct);
			if (tpaRate !== '') advStats.threePointAttemptRate = parseFloat(tpaRate);
			if (ftaRate !== '') advStats.freeThrowAttemptRate = parseFloat(ftaRate);
			if (orbPct !== '') advStats.offRebPct = parseFloat(orbPct);
			if (drbPct !== '') advStats.defRebPct = parseFloat(drbPct);
			if (trbPct !== '') advStats.totalRebPct = parseFloat(trbPct);
			if (astPct !== '') advStats.assistPct = parseFloat(astPct);
			if (stlPct !== '') advStats.stealPct = parseFloat(stlPct);
			if (blkPct !== '') advStats.blockPct = parseFloat(blkPct);
			if (tovPct !== '') advStats.turnoverPct = parseFloat(tovPct);
			if (usgPct !== '') advStats.usagePct = parseFloat(usgPct);
			if (oRtg !== '') advStats.offRating = parseFloat(oRtg);
			if (dRtg !== '') advStats.defRating = parseFloat(dRtg);
			if (bpm !== '') advStats.boxPlusMinus = parseFloat(bpm);
			return advStats;
		}

		const [
			,
			,
			tsPct,
			efgPct,
			tpaRate,
			ftaRate,
			orbPct,
			drbPct,
			trbPct,
			astPct,
			stlPct,
			blkPct,
			tovPct,
			usgPct,
			oRtg,
			dRtg
		] = advancedData;
		if (tsPct !== '') advStats.trueShootingPct = parseFloat(tsPct);
		if (efgPct !== '') advStats.effectiveFieldGoalPct = parseFloat(efgPct);
		if (tpaRate !== '') advStats.threePointAttemptRate = parseFloat(tpaRate);
		if (ftaRate !== '') advStats.freeThrowAttemptRate = parseFloat(ftaRate);
		if (orbPct !== '') advStats.offRebPct = parseFloat(orbPct);
		if (drbPct !== '') advStats.defRebPct = parseFloat(drbPct);
		if (trbPct !== '') advStats.totalRebPct = parseFloat(trbPct);
		if (astPct !== '') advStats.assistPct = parseFloat(astPct);
		if (stlPct !== '') advStats.stealPct = parseFloat(stlPct);
		if (blkPct !== '') advStats.blockPct = parseFloat(blkPct);
		if (tovPct !== '') advStats.turnoverPct = parseFloat(tovPct);
		if (usgPct !== '') advStats.usagePct = parseFloat(usgPct);
		if (oRtg !== '') advStats.offRating = parseFloat(oRtg);
		if (dRtg !== '') advStats.defRating = parseFloat(dRtg);

		return advStats;
	}

	private setBasicStats(periodData: [string[], ...Array<string>]): BoxScorePlayerGameData {
		const result: BoxScorePlayerGameData = {
			active: false
		};
		if (periodData.length > 2) {
			if (periodData.length > 20) {
				const [
					,
					mp,
					fg,
					fga,
					fgPct,
					tp,
					tpa,
					tpPct,
					ft,
					fta,
					ftPct,
					orb,
					drb,
					trb,
					ast,
					stl,
					blk,
					tov,
					pf,
					pts,
					plusMinus
				] = periodData;
				result.active = true;
				result.stats = {
					totals: {},
					periods: []
				};
				if (mp && mp !== '') {
					result.stats.totals.minutes = parseInt(mp.split(':')[0]);
					result.stats.totals.seconds = parseInt(mp.split(':')[1]);
				}
				if (fg && fg !== '') result.stats.totals.fieldGoalsMade = parseInt(fg);
				if (fga && fga !== '') result.stats.totals.fieldGoalsAttempted = parseInt(fga);
				if (fgPct && fgPct !== '') result.stats.totals.fieldGoalsPct = parseFloat(fgPct);
				if (tp && tp !== '') result.stats.totals.threePointersMade = parseInt(tp);
				if (tpa && tpa !== '') result.stats.totals.threePointersAttempted = parseInt(tpa);
				if (tpPct && tpPct !== '') result.stats.totals.threePointersPct = parseFloat(tpPct);
				if (ft && ft !== '') result.stats.totals.freeThrowsMade = parseInt(ft);
				if (fta && fta !== '') result.stats.totals.freeThrowsAttempted = parseInt(fta);
				if (ftPct && ftPct !== '') result.stats.totals.freeThrowsPct = parseFloat(ftPct);
				if (orb && orb !== '') result.stats.totals.offReb = parseInt(orb);
				if (drb && drb !== '') result.stats.totals.defReb = parseInt(drb);
				if (trb && trb !== '') result.stats.totals.totalReb = parseInt(trb);
				if (ast && ast !== '') result.stats.totals.assists = parseInt(ast);
				if (stl && stl !== '') result.stats.totals.steals = parseInt(stl);
				if (blk && blk !== '') result.stats.totals.blocks = parseInt(blk);
				if (tov && tov !== '') result.stats.totals.turnovers = parseInt(tov);
				if (pf && pf !== '') result.stats.totals.personalFouls = parseInt(pf);
				if (pts && pts !== '') result.stats.totals.points = parseInt(pts);
				if (plusMinus && plusMinus !== '') result.stats.totals.plusMinus = parseInt(plusMinus);
			} else if (periodData.length > 18) {
				const [
					,
					mp,
					fg,
					fga,
					fgPct,
					tp,
					tpa,
					tpPct,
					ft,
					fta,
					ftPct,
					orb,
					drb,
					trb,
					ast,
					stl,
					blk,
					tov,
					pf,
					pts
				] = periodData;
				result.active = true;
				result.stats = {
					totals: {},
					periods: []
				};
				if (mp && mp !== '') {
					result.stats.totals.minutes = parseInt(mp.split(':')[0]);
					result.stats.totals.seconds = parseInt(mp.split(':')[1]);
				}
				if (fg && fg !== '') result.stats.totals.fieldGoalsMade = parseInt(fg);
				if (fga && fga !== '') result.stats.totals.fieldGoalsAttempted = parseInt(fga);
				if (fgPct && fgPct !== '') result.stats.totals.fieldGoalsPct = parseFloat(fgPct);
				if (tp && tp !== '') result.stats.totals.threePointersMade = parseInt(tp);
				if (tpa && tpa !== '') result.stats.totals.threePointersAttempted = parseInt(tpa);
				if (tpPct && tpPct !== '') result.stats.totals.threePointersPct = parseFloat(tpPct);
				if (ft && ft !== '') result.stats.totals.freeThrowsMade = parseInt(ft);
				if (fta && fta !== '') result.stats.totals.freeThrowsAttempted = parseInt(fta);
				if (ftPct && ftPct !== '') result.stats.totals.freeThrowsPct = parseFloat(ftPct);
				if (orb && orb !== '') result.stats.totals.offReb = parseInt(orb);
				if (drb && drb !== '') result.stats.totals.defReb = parseInt(drb);
				if (trb && trb !== '') result.stats.totals.totalReb = parseInt(trb);
				if (ast && ast !== '') result.stats.totals.assists = parseInt(ast);
				if (stl && stl !== '') result.stats.totals.steals = parseInt(stl);
				if (blk && blk !== '') result.stats.totals.blocks = parseInt(blk);
				if (tov && tov !== '') result.stats.totals.turnovers = parseInt(tov);
				if (pf && pf !== '') result.stats.totals.personalFouls = parseInt(pf);
				if (pts && pts !== '') result.stats.totals.points = parseInt(pts);
			} else {
				const [, mp, fg, fga, fgPct, ft, fta, ftPct, orb, drb, trb, ast, stl, blk, tov, pf, pts] =
					periodData;
				result.active = true;
				result.stats = {
					totals: {},
					periods: []
				};
				if (mp && mp !== '') {
					result.stats.totals.minutes = parseInt(mp.split(':')[0]);
					result.stats.totals.seconds = parseInt(mp.split(':')[1]);
				}
				if (fg && fg !== '') result.stats.totals.fieldGoalsMade = parseInt(fg);
				if (fga && fga !== '') result.stats.totals.fieldGoalsAttempted = parseInt(fga);
				if (fgPct && fgPct !== '') result.stats.totals.fieldGoalsPct = parseFloat(fgPct);
				if (ft && ft !== '') result.stats.totals.freeThrowsMade = parseInt(ft);
				if (fta && fta !== '') result.stats.totals.freeThrowsAttempted = parseInt(fta);
				if (ftPct && ftPct !== '') result.stats.totals.freeThrowsPct = parseFloat(ftPct);
				if (orb && orb !== '') result.stats.totals.offReb = parseInt(orb);
				if (drb && drb !== '') result.stats.totals.defReb = parseInt(drb);
				if (trb && trb !== '') result.stats.totals.totalReb = parseInt(trb);
				if (ast && ast !== '') result.stats.totals.assists = parseInt(ast);
				if (stl && stl !== '') result.stats.totals.steals = parseInt(stl);
				if (blk && blk !== '') result.stats.totals.blocks = parseInt(blk);
				if (tov && tov !== '') result.stats.totals.turnovers = parseInt(tov);
				if (pf && pf !== '') result.stats.totals.personalFouls = parseInt(pf);
				if (pts && pts !== '') result.stats.totals.points = parseInt(pts);
			}
		}
		return result;
	}

	private setPeriodStats(
		periodData: [string[], ...Array<string>],
		periodValue: number,
		periodName: string
	): BoxScorePlayerPeriod {
		let active = false;
		const stats: BoxScorePlayerPeriodStats = {};

		if (periodData.length > 2) {
			if (periodData.length > 20) {
				const [
					,
					mp,
					fg,
					fga,
					fgPct,
					tp,
					tpa,
					tpPct,
					ft,
					fta,
					ftPct,
					orb,
					drb,
					trb,
					ast,
					stl,
					blk,
					tov,
					pf,
					pts,
					plusMinus
				] = periodData;
				active = true;
				if (mp && mp !== '') {
					stats.minutes = parseInt(mp.split(':')[0]);
					stats.seconds = parseInt(mp.split(':')[1]);
				}
				if (fg && fg !== '') stats.fieldGoalsMade = parseInt(fg);
				if (fga && fga !== '') stats.fieldGoalsAttempted = parseInt(fga);
				if (fgPct && fgPct !== '') stats.fieldGoalsPct = parseFloat(fgPct);
				if (tp && tp !== '') stats.threePointersMade = parseInt(tp);
				if (tpa && tpa !== '') stats.threePointersAttempted = parseInt(tpa);
				if (tpPct && tpPct !== '') stats.threePointersPct = parseFloat(tpPct);
				if (ft && ft !== '') stats.freeThrowsMade = parseInt(ft);
				if (fta && fta !== '') stats.freeThrowsAttempted = parseInt(fta);
				if (ftPct && ftPct !== '') stats.freeThrowsPct = parseFloat(ftPct);
				if (orb && orb !== '') stats.offReb = parseInt(orb);
				if (drb && drb !== '') stats.defReb = parseInt(drb);
				if (trb && trb !== '') stats.totalReb = parseInt(trb);
				if (ast && ast !== '') stats.assists = parseInt(ast);
				if (stl && stl !== '') stats.steals = parseInt(stl);
				if (blk && blk !== '') stats.blocks = parseInt(blk);
				if (tov && tov !== '') stats.turnovers = parseInt(tov);
				if (pf && pf !== '') stats.personalFouls = parseInt(pf);
				if (pts && pts !== '') stats.points = parseInt(pts);
				if (plusMinus && plusMinus !== '') stats.plusMinus = parseInt(plusMinus);
			} else if (periodData.length > 18) {
				const [
					,
					mp,
					fg,
					fga,
					fgPct,
					tp,
					tpa,
					tpPct,
					ft,
					fta,
					ftPct,
					orb,
					drb,
					trb,
					ast,
					stl,
					blk,
					tov,
					pf,
					pts
				] = periodData;
				active = true;
				if (mp && mp !== '') {
					stats.minutes = parseInt(mp.split(':')[0]);
					stats.seconds = parseInt(mp.split(':')[1]);
				}
				if (fg && fg !== '') stats.fieldGoalsMade = parseInt(fg);
				if (fga && fga !== '') stats.fieldGoalsAttempted = parseInt(fga);
				if (fgPct && fgPct !== '') stats.fieldGoalsPct = parseFloat(fgPct);
				if (tp && tp !== '') stats.threePointersMade = parseInt(tp);
				if (tpa && tpa !== '') stats.threePointersAttempted = parseInt(tpa);
				if (tpPct && tpPct !== '') stats.threePointersPct = parseFloat(tpPct);
				if (ft && ft !== '') stats.freeThrowsMade = parseInt(ft);
				if (fta && fta !== '') stats.freeThrowsAttempted = parseInt(fta);
				if (ftPct && ftPct !== '') stats.freeThrowsPct = parseFloat(ftPct);
				if (orb && orb !== '') stats.offReb = parseInt(orb);
				if (drb && drb !== '') stats.defReb = parseInt(drb);
				if (trb && trb !== '') stats.totalReb = parseInt(trb);
				if (ast && ast !== '') stats.assists = parseInt(ast);
				if (stl && stl !== '') stats.steals = parseInt(stl);
				if (blk && blk !== '') stats.blocks = parseInt(blk);
				if (tov && tov !== '') stats.turnovers = parseInt(tov);
				if (pf && pf !== '') stats.personalFouls = parseInt(pf);
				if (pts && pts !== '') stats.points = parseInt(pts);
			} else {
				const [, mp, fg, fga, fgPct, ft, fta, ftPct, orb, drb, trb, ast, stl, blk, tov, pf, pts] =
					periodData;
				active = true;
				if (mp && mp !== '') {
					stats.minutes = parseInt(mp.split(':')[0]);
					stats.seconds = parseInt(mp.split(':')[1]);
				}
				if (fg && fg !== '') stats.fieldGoalsMade = parseInt(fg);
				if (fga && fga !== '') stats.fieldGoalsAttempted = parseInt(fga);
				if (fgPct && fgPct !== '') stats.fieldGoalsPct = parseFloat(fgPct);
				if (ft && ft !== '') stats.freeThrowsMade = parseInt(ft);
				if (fta && fta !== '') stats.freeThrowsAttempted = parseInt(fta);
				if (ftPct && ftPct !== '') stats.freeThrowsPct = parseFloat(ftPct);
				if (orb && orb !== '') stats.offReb = parseInt(orb);
				if (drb && drb !== '') stats.defReb = parseInt(drb);
				if (trb && trb !== '') stats.totalReb = parseInt(trb);
				if (ast && ast !== '') stats.assists = parseInt(ast);
				if (stl && stl !== '') stats.steals = parseInt(stl);
				if (blk && blk !== '') stats.blocks = parseInt(blk);
				if (tov && tov !== '') stats.turnovers = parseInt(tov);
				if (pf && pf !== '') stats.personalFouls = parseInt(pf);
				if (pts && pts !== '') stats.points = parseInt(pts);
			}
		}
		const result: BoxScorePlayerPeriod = {
			periodValue,
			periodName,
			active,
			stats
		};
		return result;
	}
}

export class BoxScore {
	public arena?: string;
	public city?: string;
	public state?: string;
	public country?: string;
	public officials?: ParsedOfficial[];
	public home: BoxScoreTeam2 = {
		stats: {
			totals: {},
			periods: []
		},
		players: [],
		leaders: {
			points: {
				statValue: 0,
				leader: []
			},
			assists: {
				statValue: 0,
				leader: []
			},
			rebounds: {
				statValue: 0,
				leader: []
			}
		}
	};
	/**
	 * TODO: Add home.players
	 */
	public visitor: BoxScoreTeam2 = {
		stats: {
			totals: {},
			periods: []
		},
		players: [],
		leaders: {
			points: {
				statValue: 0,
				leader: []
			},
			assists: {
				statValue: 0,
				leader: []
			},
			rebounds: {
				statValue: 0,
				leader: []
			}
		}
	};

	constructor(boxScore: BoxScoreData) {
		if (boxScore.locale?.arena) this.arena = boxScore.locale.arena;
		if (boxScore.locale?.city) this.city = boxScore.locale.city;
		if (boxScore.locale?.state) this.state = boxScore.locale.state;
		if (boxScore.locale?.country) this.country = boxScore.locale.country;
		if (boxScore.officials) this.officials = boxScore.officials;
		if (boxScore.home.teamAdvanced && boxScore.home.teamBasic && boxScore.home.fourFactors) {
			const stats: TeamStats = this.formatTeamStats(
				boxScore.home.teamBasic,
				boxScore.home.teamAdvanced,
				boxScore.periods,
				boxScore.home.fourFactors
			);
			this.home.stats = stats;
		}
		if (boxScore.home.basic && boxScore.home.advanced) {
			for (let i = 0; i < boxScore.home.basic.length; i++) {
				this.home.players.push(
					new BoxScorePlayer(boxScore.home.basic[i], boxScore.home.advanced[i], i, boxScore.periods)
				);
			}
			boxScore.home.inactive?.map((p) => this.home.players.push(new BoxScorePlayer(p)));
		}
		if (
			boxScore.visitor.teamAdvanced &&
			boxScore.visitor.teamBasic &&
			boxScore.visitor.fourFactors
		) {
			const stats: TeamStats = this.formatTeamStats(
				boxScore.visitor.teamBasic,
				boxScore.visitor.teamAdvanced,
				boxScore.periods,
				boxScore.visitor.fourFactors
			);
			this.visitor.stats = stats;
		}
		if (boxScore.visitor.basic && boxScore.visitor.advanced) {
			for (let i = 0; i < boxScore.visitor.basic.length; i++) {
				this.visitor.players.push(
					new BoxScorePlayer(
						boxScore.visitor.basic[i],
						boxScore.visitor.advanced[i],
						i,
						boxScore.periods
					)
				);
			}
			boxScore.visitor.inactive?.map((p) => this.visitor.players.push(new BoxScorePlayer(p)));
		}
	}

	private formatTeamStats(
		teamBasic: string[][],
		teamAdvanced: string[],
		periods: string[],
		fourFactor: FourFactorData
	): TeamStats {
		const teamStats: TeamStats = {
			totals: this.setTeamBasicStats(teamBasic[0], teamAdvanced, fourFactor),
			periods: []
		};
		for (let i = 1; i < periods.length; i++) {
			const period = this.setTeamStatPeriods(teamBasic[i], i, periods[i]);
			teamStats.periods.push(period);
		}
		return teamStats;
	}

	public setTeamLeaders() {
		if (this.home.players.length && this.visitor.players.length) {
			const homePlayers = this.home.players;
			const visitorPlayers = this.visitor.players;

			for (let i = 0; i < homePlayers.length; i++) {
				const player = homePlayers[i];
				if (player.stats) {
					if (player.stats.totals.points) {
						if (
							this.home.leaders.points.statValue
								? player.stats.totals.points > this.home.leaders.points.statValue
								: player.stats.totals.points > 0
						) {
							this.home.leaders.points.statValue = player.stats.totals.points;
							if (player.id) this.home.leaders.points.leader = [player.id];
						} else if (player.stats.totals.points === this.home.leaders.points.statValue) {
							if (player.id) this.home.leaders.points.leader.push(player.id);
						}
					}
					if (player.stats.totals.assists) {
						if (
							this.home.leaders.assists.statValue
								? player.stats?.totals.assists > this.home.leaders.assists.statValue
								: player.stats
						) {
							this.home.leaders.assists.statValue = player.stats.totals.assists;
							if (player.id) this.home.leaders.assists.leader = [player.id];
						} else if (player.stats.totals.assists === this.home.leaders.assists.statValue) {
							if (player.id) this.home.leaders.assists.leader.push(player.id);
						}
					}

					if (player.stats.totals.totalReb) {
						if (
							this.home.leaders.rebounds.statValue
								? player.stats.totals.totalReb > this.home.leaders.rebounds.statValue
								: player.stats.totals.totalReb > 0
						) {
							this.home.leaders.rebounds.statValue = player.stats.totals.totalReb;
							if (player.id) this.home.leaders.rebounds.leader = [player.id];
						} else if (player.stats?.totals.totalReb === this.home.leaders.rebounds.statValue) {
							if (player.id) this.home.leaders.rebounds.leader.push(player.id);
						}
					}
				}
			}

			for (let i = 0; i < visitorPlayers.length; i++) {
				const player = visitorPlayers[i];
				if (player.stats) {
					if (player.stats.totals.points) {
						if (
							this.visitor.leaders.points.statValue
								? player.stats.totals.points > this.visitor.leaders.points.statValue
								: player.stats.totals.points > 0
						) {
							this.visitor.leaders.points.statValue = player.stats.totals.points;
							if (player.id) this.visitor.leaders.points.leader = [player.id];
						} else if (player.stats.totals.points === this.visitor.leaders.points.statValue) {
							if (player.id) this.visitor.leaders.points.leader.push(player.id);
						}
					}
					if (player.stats.totals.assists) {
						if (
							this.visitor.leaders.assists.statValue
								? player.stats?.totals.assists > this.visitor.leaders.assists.statValue
								: player.stats
						) {
							this.visitor.leaders.assists.statValue = player.stats.totals.assists;
							if (player.id) this.visitor.leaders.assists.leader = [player.id];
						} else if (player.stats.totals.assists === this.visitor.leaders.assists.statValue) {
							if (player.id) this.visitor.leaders.assists.leader.push(player.id);
						}
					}

					if (player.stats.totals.totalReb) {
						if (
							this.visitor.leaders.rebounds.statValue
								? player.stats.totals.totalReb > this.visitor.leaders.rebounds.statValue
								: player.stats.totals.totalReb > 0
						) {
							this.visitor.leaders.rebounds.statValue = player.stats.totals.totalReb;
							if (player.id) this.visitor.leaders.rebounds.leader = [player.id];
						} else if (player.stats?.totals.totalReb === this.visitor.leaders.rebounds.statValue) {
							if (player.id) this.visitor.leaders.rebounds.leader.push(player.id);
						}
					}
				}
			}
		}
	}

	private setTeamStatPeriods(
		periodData: string[],
		periodValue: number,
		periodName: string
	): TeamStatPeriod {
		const totals: TeamStatPeriod = {
			periodValue,
			periodName
		};

		if (periodData.length > 16) {
			const [
				fg,
				fga,
				fgPct,
				tp,
				tpa,
				tpPct,
				ft,
				fta,
				ftPct,
				orb,
				drb,
				trb,
				ast,
				stl,
				blk,
				tov,
				pf,
				pts
			] = periodData;
			if (fg !== '') totals.fieldGoalsMade = parseInt(fg);
			if (fga !== '') totals.fieldGoalsAttempted = parseInt(fga);
			if (fgPct !== '') totals.fieldGoalsPct = parseFloat(fgPct);
			if (tp !== '') totals.threePointersMade = parseInt(tp);
			if (tpa !== '') totals.threePointersAttempted = parseInt(tpa);
			if (tpPct !== '') totals.threePointersPct = parseFloat(tpPct);
			if (ft !== '') totals.freeThrowsMade = parseInt(ft);
			if (fta !== '') totals.freeThrowsAttempted = parseInt(fta);
			if (ftPct !== '') totals.freeThrowsPct = parseFloat(ftPct);
			if (orb !== '') totals.offReb = parseInt(orb);
			if (drb !== '') totals.defReb = parseInt(drb);
			if (trb !== '') totals.totalReb = parseInt(trb);
			if (ast !== '') totals.assists = parseInt(ast);
			if (stl !== '') totals.steals = parseInt(stl);
			if (blk !== '') totals.blocks = parseInt(blk);
			if (tov !== '') totals.turnovers = parseInt(tov);
			if (pf !== '') totals.personalFouls = parseInt(pf);
			if (pts !== '') totals.points = parseInt(pts);
		} else {
			const [fg, fga, fgPct, ft, fta, ftPct, orb, drb, trb, ast, stl, blk, tov, pf, pts] =
				periodData;
			if (fg !== '') totals.fieldGoalsMade = parseInt(fg);
			if (fga !== '') totals.fieldGoalsAttempted = parseInt(fga);
			if (fgPct !== '') totals.fieldGoalsPct = parseFloat(fgPct);
			if (ft !== '') totals.freeThrowsMade = parseInt(ft);
			if (fta !== '') totals.freeThrowsAttempted = parseInt(fta);
			if (ftPct !== '') totals.freeThrowsPct = parseFloat(ftPct);
			if (orb !== '') totals.offReb = parseInt(orb);
			if (drb !== '') totals.defReb = parseInt(drb);
			if (trb !== '') totals.totalReb = parseInt(trb);
			if (ast !== '') totals.assists = parseInt(ast);
			if (stl !== '') totals.steals = parseInt(stl);
			if (blk !== '') totals.blocks = parseInt(blk);
			if (tov !== '') totals.turnovers = parseInt(tov);
			if (pf !== '') totals.personalFouls = parseInt(pf);
			if (pts !== '') totals.points = parseInt(pts);
		}
		return totals;
	}

	private setTeamBasicStats(
		periodData: string[],
		teamAdvanced: string[],
		fourFactor: FourFactorData
	): TeamStatTotals {
		const totals: TeamStatTotals = {};
		if ((teamAdvanced && teamAdvanced.length > 0) || fourFactor) {
			if (!totals.advanced) totals.advanced = {};
			if (fourFactor.pace && fourFactor.pace !== '')
				totals.advanced.pace = parseFloat(fourFactor.pace);
			if (fourFactor.ftPerFga && fourFactor.ftPerFga !== '')
				totals.advanced.ftPerFga = parseFloat(fourFactor.ftPerFga);
			if (teamAdvanced.length > 12) {
				const [
					tsPct,
					efgPct,
					tpaRate,
					ftaRate,
					orbPct,
					drbPct,
					trbPct,
					astPct,
					stlPct,
					blkPct,
					tovPct,
					oRtg,
					dRtg
				] = teamAdvanced;
				if (tsPct !== '') totals.advanced.trueShootingPct = parseFloat(tsPct);
				if (efgPct !== '') totals.advanced.effectiveFieldGoalPct = parseFloat(efgPct);
				if (tpaRate !== '') totals.advanced.threePointAttemptRate = parseFloat(tpaRate);
				if (ftaRate !== '') totals.advanced.freeThrowAttemptRate = parseFloat(ftaRate);
				if (orbPct !== '') totals.advanced.offRebPct = parseFloat(orbPct);
				if (drbPct !== '') totals.advanced.defRebPct = parseFloat(drbPct);
				if (trbPct !== '') totals.advanced.totalRebPct = parseFloat(trbPct);
				if (astPct !== '') totals.advanced.assistPct = parseFloat(astPct);
				if (stlPct !== '') totals.advanced.stealPct = parseFloat(stlPct);
				if (blkPct !== '') totals.advanced.blockPct = parseFloat(blkPct);
				if (tovPct !== '') totals.advanced.turnoverPct = parseFloat(tovPct);
				if (oRtg !== '') totals.advanced.offRating = parseFloat(oRtg);
				if (dRtg !== '') totals.advanced.defRating = parseFloat(dRtg);
			} else {
				const [
					tsPct,
					efgPct,
					ftaRate,
					orbPct,
					drbPct,
					trbPct,
					astPct,
					stlPct,
					blkPct,
					tovPct,
					oRtg,
					dRtg
				] = teamAdvanced;
				if (tsPct !== '') totals.advanced.trueShootingPct = parseFloat(tsPct);
				if (efgPct !== '') totals.advanced.effectiveFieldGoalPct = parseFloat(efgPct);
				if (ftaRate !== '') totals.advanced.freeThrowAttemptRate = parseFloat(ftaRate);
				if (orbPct !== '') totals.advanced.offRebPct = parseFloat(orbPct);
				if (drbPct !== '') totals.advanced.defRebPct = parseFloat(drbPct);
				if (trbPct !== '') totals.advanced.totalRebPct = parseFloat(trbPct);
				if (astPct !== '') totals.advanced.assistPct = parseFloat(astPct);
				if (stlPct !== '') totals.advanced.stealPct = parseFloat(stlPct);
				if (blkPct !== '') totals.advanced.blockPct = parseFloat(blkPct);
				if (tovPct !== '') totals.advanced.turnoverPct = parseFloat(tovPct);
				if (oRtg !== '') totals.advanced.offRating = parseFloat(oRtg);
				if (dRtg !== '') totals.advanced.defRating = parseFloat(dRtg);
			}
		}

		if (periodData.length > 16) {
			const [
				fg,
				fga,
				fgPct,
				tp,
				tpa,
				tpPct,
				ft,
				fta,
				ftPct,
				orb,
				drb,
				trb,
				ast,
				stl,
				blk,
				tov,
				pf,
				pts
			] = periodData;
			if (fg !== '') totals.fieldGoalsMade = parseInt(fg);
			if (fga !== '') totals.fieldGoalsAttempted = parseInt(fga);
			if (fgPct !== '') totals.fieldGoalsPct = parseFloat(fgPct);
			if (tp !== '') totals.threePointersMade = parseInt(tp);
			if (tpa !== '') totals.threePointersAttempted = parseInt(tpa);
			if (tpPct !== '') totals.threePointersPct = parseFloat(tpPct);
			if (ft !== '') totals.freeThrowsMade = parseInt(ft);
			if (fta !== '') totals.freeThrowsAttempted = parseInt(fta);
			if (ftPct !== '') totals.freeThrowsPct = parseFloat(ftPct);
			if (orb !== '') totals.offReb = parseInt(orb);
			if (drb !== '') totals.defReb = parseInt(drb);
			if (trb !== '') totals.totalReb = parseInt(trb);
			if (ast !== '') totals.assists = parseInt(ast);
			if (stl !== '') totals.steals = parseInt(stl);
			if (blk !== '') totals.blocks = parseInt(blk);
			if (tov !== '') totals.turnovers = parseInt(tov);
			if (pf !== '') totals.personalFouls = parseInt(pf);
			if (pts !== '') totals.points = parseInt(pts);
		} else {
			const [fg, fga, fgPct, ft, fta, ftPct, orb, drb, trb, ast, stl, blk, tov, pf, pts] =
				periodData;
			if (fg !== '') totals.fieldGoalsMade = parseInt(fg);
			if (fga !== '') totals.fieldGoalsAttempted = parseInt(fga);
			if (fgPct !== '') totals.fieldGoalsPct = parseFloat(fgPct);
			if (ft !== '') totals.freeThrowsMade = parseInt(ft);
			if (fta !== '') totals.freeThrowsAttempted = parseInt(fta);
			if (ftPct !== '') totals.freeThrowsPct = parseFloat(ftPct);
			if (orb !== '') totals.offReb = parseInt(orb);
			if (drb !== '') totals.defReb = parseInt(drb);
			if (trb !== '') totals.totalReb = parseInt(trb);
			if (ast !== '') totals.assists = parseInt(ast);
			if (stl !== '') totals.steals = parseInt(stl);
			if (blk !== '') totals.blocks = parseInt(blk);
			if (tov !== '') totals.turnovers = parseInt(tov);
			if (pf !== '') totals.personalFouls = parseInt(pf);
			if (pts !== '') totals.points = parseInt(pts);
		}
		return totals;
	}
}

export const setPlayerId = async (player: BoxScorePlayer) => {
	const result = await addOrFindPlayer(player);
	if (result) player.id = result._id;
};

export const setOfficialId = async (official: ParsedOfficial) => {
	const result = await addOrFindOfficial(official);
	if (result) official.id = result._id;
};
