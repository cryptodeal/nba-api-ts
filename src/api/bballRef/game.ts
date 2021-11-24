import { loadBoxScorePage } from './fetchers';
import cheerio from 'cheerio';
import { Game2Document, IsPopulated } from '../../interfaces/mongoose.gen';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

class ParsedOfficial {
	constructor(public name?: string, public url?: string, public jerseyNumber?: string) {
		this.name = name;
		this.url = url;
		this.jerseyNumber = jerseyNumber;
	}
}

/** Query Helpers */
class BoxScoreQuery {
	public date: string;
	public homeAbbrev?: string;
	public visitorAbbrev?: string;
	public isValid = false;
	constructor(game: Game2Document) {
		this.date =
			game.time == false
				? dayjs(game?.date).format('YYYYMMDD')
				: dayjs(game?.date).tz('America/New_York').format('YYYYMMDD');

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
		if (this.homeAbbrev && this.date && this.visitorAbbrev) this.isValid = true;
	}
}

/** Boxscore Parsers */
const parseGameOfficials = ($: cheerio.Root) => {
	const officials: ParsedOfficial[] = [];
	$('strong:contains("Officials:")')
		.parent()
		.find('a')
		.each(function (i, link) {
			let url: string | undefined;
			const href = $(link).attr('href')?.split('/');
			if (href) url = href[href.length - 1].split('.')[0];
			const name = $(link).text().trim();
			const official = new ParsedOfficial(name, url);
			officials.push(official);
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
	return periods;
};

const fetchTeamBasicData = ($: cheerio.Root, team: string, period: string) => {
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

const fetchBasicData = ($: cheerio.Root, team: string, period: string): (string | string[])[][] => {
	const tableData: (string | string[])[][] = [];
	$(`#box-${team}-${period}-basic`).each(function (i, table) {
		$(table)
			.find('tbody')
			.each(function (i, tbody) {
				$(tbody)
					.find('tr')
					.each(function (j, row) {
						if (j !== 5) {
							const rowData: (string | string[])[] = [];
							$(row)
								.find('th')
								.each(function (k, cell) {
									const tempVal = [$(cell).text().trim()];
									$(cell)
										.find('a')
										.each(function (l, link) {
											const href = $(link).attr('href')?.split('/');
											const url = href?.[href.length - 1].split('.')[0];
											if (url) tempVal.push(url);
											if (url) rowData[k] = tempVal;
										});
									//console.log($(cell).text().trim())
								});
							$(row)
								.find('td')
								.each(function (k, cell) {
									rowData[k + 1] = $(cell).text().trim();
									//console.log($(cell).text().trim())
								});
							tableData.push(rowData);
							//console.log(rowData)
						}
					});
			});
	});
	return tableData;
};

const getBasicData = ($: cheerio.Root, team: string, periods: string[]) => {
	const allData: (string | string[])[][][] = [];
	for (let i = 0; i < periods.length; i++) {
		//if no data in allData, add initial data (totals)
		if (i == 0) {
			const initData = fetchBasicData($, team, periods[i]);
			initData.forEach((playerData: (string | string[])[]) => {
				allData.push([playerData]);
			});
		}
		//if data in allData, merge with new data
		else {
			const periodData = fetchBasicData($, team, periods[i]);
			periodData.forEach((playerData: (string | string[])[], j: number) => {
				allData[j][i] = playerData;
			});
		}
	}
	return allData;
};

export const getBoxScore = async (
	game: Game2Document
): Promise<void | (string | string[])[][][]> => {
	const { date, homeAbbrev, visitorAbbrev, isValid } = new BoxScoreQuery(game);
	if (isValid && homeAbbrev) {
		const $ = await loadBoxScorePage(date, homeAbbrev);
		//const officials = parseGameOfficials($);
		//const [visitorLineScore, homeLineScore] = parseLineScore($);
		const periods = parseGamePeriods($);
		return getBasicData($, homeAbbrev, periods);
	}
	return;
};
