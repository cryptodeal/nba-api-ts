import { loadBoxScorePage } from '../fetchers';
import { Types } from 'mongoose';
import cheerio from 'cheerio';
import { Game2Document, IsPopulated } from '../../../db/interfaces/mongoose.gen';
import { BoxScore, setPlayerId, setOfficialId } from './utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

/** Useful Interfaces */
export class ParsedOfficial {
	public _id?: Types.ObjectId;
	constructor(public name: string, public url: string, public jerseyNumber?: string) {
		this.name = name;
		this.url = url;
		this.jerseyNumber = jerseyNumber;
	}

	set id(val) {
		this._id = val;
	}

	get id() {
		return this._id;
	}
}

interface InactivePlayer {
	name: string;
	url: string;
}

interface InactivePlayers {
	home: InactivePlayer[];
	visitor: InactivePlayer[];
}

export type FourFactorData = {
	pace: string | undefined;
	ftPerFga: string | undefined;
};

interface FourFactors {
	home: FourFactorData;
	visitor: FourFactorData;
}

export type BoxScoreLocale = {
	arena?: string | undefined;
	city?: string | undefined;
	state?: string | undefined;
	country?: string | undefined;
};

export type BoxScoreTeam = {
	teamBasic?: string[][];
	teamAdvanced?: string[];
	basic?: [string[], ...string[]][][];
	advanced?: string[][];
	lineScore?: string[];
	inactive?: InactivePlayer[];
	fourFactors?: FourFactorData;
};
export type BoxScoreData = {
	home: BoxScoreTeam;
	visitor: BoxScoreTeam;
	periods: string[];
	officials?: ParsedOfficial[];
	locale?: BoxScoreLocale;
};

/** Query Helpers */
class BoxScoreQuery {
	public date: string;
	public homeAbbrev?: string;
	public visitorAbbrev?: string;
	public isValid = false;
	public boxScoreUrl: string;
	constructor(game: Game2Document) {
		this.boxScoreUrl = game.meta.helpers.bballRef.boxScoreUrl;
		if (game.time) {
			//const tempDate = dayjs(game.date).tz('America/New_York');
			//console.log(tempDate);
			//console.log(tempDate.utcOffset());
			this.date = dayjs(game.date).tz('America/New_York').format('YYYYMMDD');
		} else {
			this.date = dayjs(game.date).format('YYYYMMDD');
		}

		/** Find Home Abbreviation for Season */
		if (game.home.team && IsPopulated(game.home.team)) {
			for (let i = 0; i < game.home.team.seasons.length; i++) {
				if (game.home.team.seasons[i].season === game.meta.helpers.bballRef.year) {
					this.homeAbbrev = game.home.team.seasons[i].infoCommon.abbreviation;
				}
			}
		}

		/** Find Visitor Abbreviation for Season */
		if (game.visitor.team && IsPopulated(game.visitor.team)) {
			for (let j = 0; j < game.visitor.team.seasons.length; j++) {
				if (game.visitor.team.seasons[j].season === game.meta.helpers.bballRef.year) {
					this.visitorAbbrev = game.visitor.team.seasons[j].infoCommon.abbreviation;
				}
			}
		}

		/** If valid query, isValid = True */
		if ((this.homeAbbrev && this.date && this.visitorAbbrev) || this.boxScoreUrl)
			this.isValid = true;
	}
}

/** Boxscore Parsers */
const parseOfficials = ($: cheerio.Root) => {
	const officials: ParsedOfficial[] = [];
	$('strong:contains("Officials:")')
		.parent()
		.find('a')
		.each(function (i, link) {
			const href = $(link).attr('href')?.split('/');
			if (href) {
				const url = href[href.length - 1].split('.')[0];
				const name = $(link).text().trim();
				const official = new ParsedOfficial(name, url);
				officials.push(official);
			}
		});
	return officials;
};

/** finds html comments containing line score data
 * loads resulting comments into cheerio as html string
 */
const findLineScoreData = ($: cheerio.Root): cheerio.Root => {
	$(`#all_line_score`).each(function (i, div) {
		$(div)
			.contents()
			.each(function (this: cheerio.Element) {
				if (this.type === 'comment') {
					const comment = this.data;
					if (comment) $ = cheerio.load(comment);
				}
			});
	});
	return $;
};

/** takes linescore data loaded into cheerio and returns
 * [visitLineScore, homeLineScore], each formatted as
 * [Q1, Q2, Q3, Q4, OT, 2OT, ..., Total]
 */
const parseLineScore = ($: cheerio.Root): string[][] => {
	$ = findLineScoreData($);
	const tableData: string[][] = [];
	$(`#line_score`).each(function (i, table) {
		$(table)
			.find('tbody')
			.each(function (i, tbody) {
				$(tbody)
					.find('tr')
					.each(function (j, row) {
						const rowData: string[] = [];
						$(row)
							.find('td')
							.each(function (k, cell) {
								rowData[k] = $(cell).text().trim();
							});
						tableData.push(rowData);
					});
			});
	});
	return [tableData[0], tableData[1]];
};

/** creates array of period values (e.g. 'q1', 'q2', etc.) */
const parseGamePeriods = ($: cheerio.Root): string[] => {
	const periods: string[] = [];
	$(`.switcher`).each(function (i: number, periodDiv: cheerio.Element) {
		$(periodDiv)
			.find('div')
			.each(function (i: number, period: cheerio.Element) {
				periods.push($(period).text().trim().toLowerCase());
			});
	});
	if (!periods.length) periods.push('game');
	return periods;
};

const fetchTeamBasicData = ($: cheerio.Root, team: string, period: string): string[] => {
	const tableData: string[] = [];
	$(`#box-${team}-${period}-basic`).each(function (i, table) {
		$(table)
			.find('tfoot')
			.each(function (i, tfoot) {
				$(tfoot)
					.find('tr')
					.each(function (j, row) {
						$(row)
							.find('td')
							.each(function (k, cell) {
								if (k !== 0 && k < 19) {
									tableData.push($(cell).text().trim());
								}
							});
					});
			});
	});
	return tableData;
};

const getTeamBasicData = ($: cheerio.Root, team: string, periods: string[]): string[][] => {
	const allData: string[][] = [];
	for (let i = 0; i < periods.length; i++) {
		allData.push(fetchTeamBasicData($, team, periods[i]));
	}
	return allData;
};

const fetchBasicData = (
	$: cheerio.Root,
	team: string,
	period: string
): [string[], ...string[]][] => {
	const tableData: [string[], ...string[]][] = [];
	$(`#box-${team}-${period}-basic`).each(function (i, table) {
		$(table)
			.find('tbody')
			.each(function (i, tbody) {
				$(tbody)
					.find('tr')
					.each(function (j, row) {
						if (j !== 5) {
							const rowData: [string[], ...Array<string>] = [[]];
							$(row)
								.find('th')
								.each(function (k, cell) {
									rowData[0].push($(cell).text().trim());
									$(cell)
										.find('a')
										.each(function (l, link) {
											const href = $(link).attr('href')?.split('/');
											const url = href?.[href.length - 1].split('.')[0];
											if (url) rowData[0].push(url);
										});
								});
							$(row)
								.find('td')
								.each(function (k, cell) {
									rowData[k + 1] = $(cell).text().trim();
								});
							tableData.push(rowData);
						}
					});
			});
	});
	return tableData;
};

const getBasicData = (
	$: cheerio.Root,
	team: string,
	periods: string[]
): [string[], ...string[]][][] => {
	const allData: [string[], ...string[]][][] = [];
	for (let i = 0; i < periods.length; i++) {
		//if no data in allData, add initial data (totals)
		if (i == 0) {
			const initData = fetchBasicData($, team, periods[i]);
			initData.forEach((playerData: [string[], ...string[]]) => {
				allData.push([playerData]);
			});
		}
		//if data in allData, merge with new data
		else {
			const periodData = fetchBasicData($, team, periods[i]);
			periodData.forEach((playerData: [string[], ...string[]], j: number) => {
				allData[j][i] = playerData;
			});
		}
	}
	return allData;
};

const getAdvancedData = ($: cheerio.Root, team: string): string[][] => {
	const tableData: string[][] = [];
	$(`#box-${team}-game-advanced`).each(function (i, table) {
		$(table)
			.find('tbody')
			.each(function (i, tbody) {
				$(tbody)
					.find('tr')
					.each(function (j, row) {
						if (j !== 5) {
							const rowData: string[] = [];
							$(row)
								.find('th')
								.each(function (k, cell) {
									rowData[k] = $(cell).text().trim();
								});
							$(row)
								.find('td')
								.each(function (k, cell) {
									rowData[k + 1] = $(cell).text().trim();
								});
							tableData.push(rowData);
						}
					});
			});
	});
	return tableData;
};

const getTeamAdvancedData = ($: cheerio.Root, team: string): string[] => {
	const tableData: string[] = [];
	$(`#box-${team}-game-advanced`).each(function (i, table) {
		$(table)
			.find('tfoot')
			.each(function (i, tfoot) {
				$(tfoot)
					.find('tr')
					.each(function (j, row) {
						$(row)
							.find('td')
							.each(function (k, cell) {
								if (k !== 0 && k !== 12 && k < 15) {
									tableData.push($(cell).text().trim());
								}
							});
					});
			});
	});
	return tableData;
};

const parseInactivePlayers = (
	$: cheerio.Root,
	homeAbbrev: string,
	visitorAbbrev: string
): InactivePlayers => {
	const inactive: InactivePlayers = {
		home: [],
		visitor: []
	};
	const selected = $('strong:contains("Inactive:")').parent();
	if (selected) {
		const [vSplit1, hSplit1] = selected.text().split(homeAbbrev);
		if (hSplit1?.length) {
			hSplit1.split(',').map((p) => {
				if (p.trim() !== 'None') {
					const player: InactivePlayer = {
						name: p.trim(),
						url: ''
					};
					inactive.home.push(player);
				}
			});
		}

		if (vSplit1.length) {
			vSplit1
				.split(visitorAbbrev)[1]
				.split(',')
				.map((p) => {
					if (p.trim() !== 'None') {
						const player: InactivePlayer = {
							name: p.trim(),
							url: ''
						};
						inactive.visitor.push(player);
					}
				});
		}

		selected.find('a').each(function (i, link) {
			const name = $(link).text().trim();
			const href = $(link).attr('href')?.split('/');
			const homeIndex = inactive.home.findIndex((p) => p.name === name);
			const visitorIndex = inactive.visitor.findIndex((p) => p.name === name);
			if (href !== undefined) {
				if (homeIndex !== -1) {
					if (href !== undefined) {
						inactive.home[homeIndex].url = href[href.length - 1].split('.')[0];
					}
				} else {
					inactive.visitor[visitorIndex].url = href[href.length - 1].split('.')[0];
				}
			}
		});
	}
	return inactive;
};

const findFourFactors = ($: cheerio.Root): cheerio.Root => {
	$(`#all_four_factors`).each(function (i, div) {
		$(div)
			.contents()
			.each(function (this: cheerio.Element) {
				if (this.type === 'comment') {
					const comment = this.data;
					if (comment) $ = cheerio.load(comment);
				}
			});
	});
	return $;
};

const getFourFactor = ($: cheerio.Root): FourFactors => {
	$ = findFourFactors($);
	const tableData: FourFactors = {
		home: {
			pace: undefined,
			ftPerFga: undefined
		},
		visitor: {
			pace: undefined,
			ftPerFga: undefined
		}
	};
	$(`#div_four_factors`).each(function (i, table) {
		$(table)
			.find('tbody')
			.each(function (i, tbody) {
				$(tbody)
					.find('tr')
					.each(function (j, row) {
						const rowData: string[] = [];
						$(row)
							.find('td')
							.each(function (k, cell) {
								rowData.push($(cell).text().trim());
							});
						const [pace, , , , ftPerFga] = rowData;
						tableData[j == 0 ? 'visitor' : 'home'].pace = pace;
						tableData[j == 0 ? 'visitor' : 'home'].ftPerFga = ftPerFga;
					});
			});
	});
	return tableData;
};

const parseLocale = ($: cheerio.Root): boolean | BoxScoreLocale => {
	if ($('.scorebox_meta').find('div').length > 2) {
		const [arena, city, state] = $('.scorebox_meta')
			.find('div:nth-child(2)')
			.text()
			.trim()
			.split(',');
		const tempLocale: BoxScoreLocale = {};
		if (arena && arena !== '') tempLocale.arena = arena.trim();
		if (city && city !== '') tempLocale.city = city.trim();
		if (state && state !== '') tempLocale.state = state.trim();
		return tempLocale;
	}
	return false;
};

const getBoxScore = async (game: Game2Document): Promise<void | BoxScore> => {
	const { date, homeAbbrev, visitorAbbrev, isValid, boxScoreUrl } = new BoxScoreQuery(game);
	if (isValid && homeAbbrev && visitorAbbrev) {
		const $ = await loadBoxScorePage(date, homeAbbrev, boxScoreUrl);
		const boxScore: BoxScoreData = {
			home: {},
			visitor: {},
			periods: parseGamePeriods($)
		};
		const [visitorLineScore, homeLineScore] = parseLineScore($);
		const inactive = parseInactivePlayers($, homeAbbrev, visitorAbbrev);
		const officials = parseOfficials($);
		const fourFactors = getFourFactor($);
		const locale = parseLocale($);
		/** Set data for home team */
		boxScore.home.lineScore = homeLineScore;
		boxScore.home.basic = getBasicData($, homeAbbrev, boxScore.periods);
		boxScore.home.advanced = getAdvancedData($, homeAbbrev);
		boxScore.home.teamBasic = getTeamBasicData($, homeAbbrev, boxScore.periods);
		boxScore.home.teamAdvanced = getTeamAdvancedData($, homeAbbrev);
		boxScore.home.inactive = inactive.home;
		boxScore.home.fourFactors = fourFactors.home;

		/** Set data for visitor team */
		boxScore.visitor.lineScore = visitorLineScore;
		boxScore.visitor.basic = getBasicData($, visitorAbbrev, boxScore.periods);
		boxScore.visitor.advanced = getAdvancedData($, visitorAbbrev);
		boxScore.visitor.teamBasic = getTeamBasicData($, visitorAbbrev, boxScore.periods);
		boxScore.visitor.teamAdvanced = getTeamAdvancedData($, visitorAbbrev);
		boxScore.visitor.inactive = inactive.visitor;
		boxScore.visitor.fourFactors = fourFactors.visitor;
		/** Set non-team specific data */
		if (officials.length) boxScore.officials = officials;
		if (locale !== undefined && typeof locale !== 'boolean') boxScore.locale = locale;
		const boxScoreResult = new BoxScore(boxScore);
		for (let i = 0; i < boxScoreResult.home.players.length; i++) {
			await setPlayerId(boxScoreResult.home.players[i]);
		}
		for (let j = 0; j < boxScoreResult.visitor.players.length; j++) {
			await setPlayerId(boxScoreResult.visitor.players[j]);
		}
		if (boxScoreResult.officials) {
			for (let k = 0; k < boxScoreResult.officials?.length; k++) {
				await setOfficialId(boxScoreResult.officials[k]);
			}
		}
		boxScoreResult.setTeamLeaders();

		return boxScoreResult;
	}
	return;
};

export default getBoxScore;
