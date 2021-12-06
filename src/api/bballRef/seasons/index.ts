import { loadSeasonsPage, loadSeasonSchedule } from '../fetchers';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

export type BballRefSeason = {
	displaySeason: string;
	leagueStr: string;
	champion?: string;
	mvp: BballRefLeagueMvp[];
	roty: BballRefLeagueRoty[];
	pointsLeader?: BballRefLeaguePtsLead;
	reboundLeader?: BballRefLeagueRebLead;
	assistLeader?: BballRefLeagueAstLead;
	winShareLeader?: BballRefLeagueWinShareLead;
};

interface BballRefLeagueRoty {
	name: string;
	url: string;
}

interface BballRefLeagueRebLead {
	name: string;
	url: string;
	value: number;
}

interface BballRefLeaguePtsLead {
	name: string;
	url: string;
	value: number;
}

interface BballRefLeagueAstLead {
	name: string;
	url: string;
	value: number;
}

interface BballRefLeagueWinShareLead {
	name: string;
	url: string;
	value: number;
}

interface BballRefLeagueMvp {
	name: string;
	url: string;
}

const parseSeasons = ($: cheerio.Root) => {
	const tableData: BballRefSeason[] = [];
	$(`#stats`).each(function (i, table) {
		$(table)
			.find('tbody')
			.each(function (i, tbody) {
				$(tbody)
					.find('tr')
					.each(function (j, row) {
						if (j > 1) {
							const champion = $(row).find('[data-stat=champion]').text().trim();
							const season: BballRefSeason = {
								displaySeason: $(row).find('[data-stat=season]').text().trim(),
								leagueStr: $(row).find('[data-stat=lg_id]').text().trim(),
								mvp: [],
								roty: []
							};
							if (champion) season.champion = champion;
							//parse season MVP(s)
							$(row)
								.find('[data-stat=mvp]')
								.each(function (i, mvpDat) {
									$(mvpDat)
										.find('a')
										.each(function (i, mvpLink) {
											const hrefSplit = $(mvpLink).attr('href')?.split('/');
											if (hrefSplit) {
												const url = hrefSplit[hrefSplit.length - 1].split('.')[0];
												const mvpPlayer: BballRefLeagueMvp = {
													name: $(mvpLink).text().trim(),
													url
												};
												season.mvp.push(mvpPlayer);
											}
										});
								});

							//parse season ROTY(s)
							$(row)
								.find('[data-stat=roy]')
								.each(function (i, royDat) {
									$(royDat)
										.find('a')
										.each(function (i, royLink) {
											const hrefSplit = $(royLink).attr('href')?.split('/');
											if (hrefSplit) {
												const url = hrefSplit[hrefSplit.length - 1].split('.')[0];
												const rotyPlayer: BballRefLeagueRoty = {
													name: $(royLink).text().trim(),
													url
												};
												season.roty.push(rotyPlayer);
											}
										});
								});

							//parse season Points Leader
							$(row)
								.find('[data-stat=pts_leader_name]')
								.each(function (i, ptsDat) {
									const textValue = $(ptsDat).text().trim();
									const valueSplit = textValue.split('(');
									const value = valueSplit[valueSplit.length - 1].replace(/[()\ \s-]+/g, '');
									$(ptsDat)
										.find('a')
										.each(function (i, ptsLink) {
											const hrefSplit = $(ptsLink).attr('href')?.split('/');
											if (hrefSplit) {
												const url = hrefSplit[hrefSplit.length - 1].split('.')[0];
												const ptsLeader: BballRefLeaguePtsLead = {
													name: $(ptsLink).text().trim(),
													url,
													value: parseInt(value)
												};
												season.pointsLeader = ptsLeader;
											}
										});
								});

							//parse season Rebound Leader
							$(row)
								.find('[data-stat=trb_leader_name]')
								.each(function (i, trbDat) {
									const textValue = $(trbDat).text().trim();
									const valueSplit = textValue.split('(');
									const value = valueSplit[valueSplit.length - 1].replace(/[()\ \s-]+/g, '');
									$(trbDat)
										.find('a')
										.each(function (i, trbLink) {
											const hrefSplit = $(trbLink).attr('href')?.split('/');
											if (hrefSplit) {
												const url = hrefSplit[hrefSplit.length - 1].split('.')[0];
												const trbLeader: BballRefLeagueRebLead = {
													name: $(trbLink).text().trim(),
													url,
													value: parseInt(value)
												};
												season.reboundLeader = trbLeader;
											}
										});
								});

							//parse season Assist Leader
							$(row)
								.find('[data-stat=ast_leader_name]')
								.each(function (i, astDat) {
									const textValue = $(astDat).text().trim();
									const valueSplit = textValue.split('(');
									const value = valueSplit[valueSplit.length - 1].replace(/[()\ \s-]+/g, '');
									$(astDat)
										.find('a')
										.each(function (i, astLink) {
											const hrefSplit = $(astLink).attr('href')?.split('/');
											if (hrefSplit) {
												const url = hrefSplit[hrefSplit.length - 1].split('.')[0];
												const astLeader: BballRefLeagueAstLead = {
													name: $(astLink).text().trim(),
													url,
													value: parseInt(value)
												};
												season.assistLeader = astLeader;
											}
										});
								});

							//parse season Win Share Leader
							$(row)
								.find('[data-stat=ws_leader_name]')
								.each(function (i, wsDat) {
									const textValue = $(wsDat).text().trim();
									const valueSplit = textValue.split('(');
									const value = valueSplit[valueSplit.length - 1].replace(/[()\ \s-]+/g, '');
									$(wsDat)
										.find('a')
										.each(function (i, wsLink) {
											const hrefSplit = $(wsLink).attr('href')?.split('/');
											if (hrefSplit) {
												const url = hrefSplit[hrefSplit.length - 1].split('.')[0];
												const wsLeader: BballRefLeagueWinShareLead = {
													name: $(wsLink).text().trim(),
													url,
													value: parseFloat(value)
												};
												season.winShareLeader = wsLeader;
											}
										});
								});
							tableData.push(season);
						}
					});
			});
	});
	return tableData;
};

export const getSeasons = async () => {
	const $ = await loadSeasonsPage();

	return parseSeasons($);
};

const parseSeasonMonths = ($: cheerio.Root) => {
	const months: string[] = [];
	$(`.filter`).each(function (i, monthDiv) {
		$(monthDiv)
			.find('div')
			.each(function (i, monthElem) {
				if (!$(monthElem).attr('class')) {
					const monthSplit = $(monthElem).text().trim().toLowerCase().split(' ');
					months.push(monthSplit.join('-'));
				}
			});
	});
	return months;
};

export type SeasonGameItem = {
	date: Dayjs;
	time: boolean;
	boxScoreUrl?: string;
	home: {
		name: string;
		abbreviation?: string;
		score?: number;
	};
	visitor: {
		name: string;
		abbreviation?: string;
		score?: number;
	};
	otCount?: string;
	attendance?: number;
	notes?: string;
};

const parseSeasonGames = ($: cheerio.Root) => {
	const tableData: SeasonGameItem[] = [];
	$(`#schedule`).each(function (i, table) {
		$(table)
			.find('tbody')
			.each(function (i, tbody) {
				$(tbody)
					.find('tr')
					.each(function (j, row) {
						if ($(row).attr('class') !== 'thead') {
							const game: SeasonGameItem = {
								date: dayjs($(row).find('[data-stat=date_game]').text().trim()),
								time: false,
								home: {
									name: $(row).find('[data-stat=home_team_name]').text().trim()
								},
								visitor: {
									name: $(row).find('[data-stat=visitor_team_name]').text().trim()
								}
							};

							/** Set boxscore url for SeasonGameItem */
							const boxScoreUrl = $(row)
								.find('[data-stat=box_score_text]')
								.find('a')
								.attr('href')
								?.split('/');
							if (boxScoreUrl) {
								game.boxScoreUrl = boxScoreUrl[boxScoreUrl.length - 1].split('.')[0];
							}

							/** if exists, set visitor team score */
							const visitorScore = $(row).find('[data-stat=visitor_pts]').text().trim();
							if (visitorScore !== '') {
								game.visitor.score = parseInt(visitorScore);
							}

							/** if exists, set home team score */
							const homeScore = $(row).find('[data-stat=home_pts]').text().trim();
							if (homeScore !== '') {
								game.home.score = parseInt(homeScore);
							}

							/** set visitor team abbreviation */
							const visitorHref = $(row)
								.find('[data-stat=visitor_team_name]')
								.find('a')
								.attr('href')
								?.split('/');
							if (visitorHref) {
								game.visitor.abbreviation = visitorHref[visitorHref.length - 2];
							}

							/** set home team abbreviation */
							const homeHref = $(row)
								.find('[data-stat=home_team_name]')
								.find('a')
								.attr('href')
								?.split('/');
							if (homeHref) {
								game.home.abbreviation = homeHref[homeHref.length - 2];
							}

							/** if exists, set overtime count */
							const otCount = $(row).find('[data-stat=overtimes]').text().trim();
							if (otCount !== '') game.otCount = otCount;

							/** if exists, set attendance */
							const attendance = $(row).find('[data-stat=attendance]').text().trim();
							if (attendance !== '') game.attendance = parseInt(attendance);

							/** if exists, set attendance */
							const remarks = $(row).find('[data-stat=game_remarks]').text().trim();
							if (remarks !== '') game.notes = remarks;

							/** if start time listed, manipulate date and set game.time = true */
							$(row)
								.find('[data-stat=game_start_time]')
								.each(function (i, t) {
									const time = $(t).text().trim();
									if (time !== '') {
										game.time = true;
										const halfOfDay = time.slice(-1);
										let hours = parseInt(time.split(':')[0]);
										const minutes = parseInt(time.split(':')[1].slice(0, -1));
										if (halfOfDay === 'p' && hours !== 12) {
											hours += 12;
										}
										const dateTime = game.date.set('hour', hours).set('minute', minutes);
										game.date = dateTime;
									}
								});
							tableData.push(game);
						}
					});
			});
	});
	return tableData;
};

export const getSeasonGames = async (league: string, year: number) => {
	const $ = await loadSeasonSchedule(league, year);
	const months = parseSeasonMonths($);
	const initGames = parseSeasonGames($);
	const remainingMonths = await Promise.all(
		months.map((month) => {
			return loadSeasonSchedule(league, year, month).then(($) => {
				return parseSeasonGames($);
			});
		})
	);

	const games = [...initGames];
	remainingMonths.forEach((month) => {
		month.map((game) => {
			games.push(game);
		});
	});

	return {
		games,
		league,
		year
	};
};
