import { loadSeasonsPage, loadSeasonSchedule } from '../fetchers';
import dayjs, { Dayjs } from 'dayjs';

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

const parseSeasonGames = ($: cheerio.Root) => {
	const tableData: (string | boolean | Dayjs)[][] = [];
	$(`#schedule`).each(function (i, table) {
		$(table)
			.find('tbody')
			.each(function (i, tbody) {
				$(tbody)
					.find('tr')
					.each(function (j, row) {
						if ($(row).attr('class') !== 'thead') {
							const rowData: (string | boolean | Dayjs)[] = [];
							$(row)
								.find('th')
								.each(function (k, cell) {
									const dateString = $(cell).text().trim().replace(/ /g, '');
									const date = dateString.split(',');
									rowData[k] = dayjs(`${date[1]} ${date[2]}`, 'MMM D YYYY');
								});
							$(row)
								.find('td')
								.each(function (k, cell) {
									rowData[k + 1] = $(cell).text().trim();
								});
							let teamAbbrev;
							$(row)
								.find('td:nth-of-type(1)')
								.each(function (k, cell) {
									const csk = $(cell).attr('csk');
									if (csk) teamAbbrev = csk.trim();
								});
							if (!teamAbbrev) {
								$(row)
									.find('td:nth-of-type(2)')
									.each(function (k, cell) {
										const csk = $(cell).attr('csk');
										if (csk) teamAbbrev = csk.trim();
									});
							}
							if (teamAbbrev) rowData.push(teamAbbrev);
							if (rowData.length > 10) {
								const time = rowData[1];
								if (time !== '' && typeof time === 'string') {
									rowData[1] = true;
									const halfOfDay = time.slice(-1);
									let hours = parseInt(time.split(':')[0]);
									const minutes = parseInt(time.split(':')[1].slice(0, -1));
									if (halfOfDay === 'p') {
										hours += 12;
									}
									if (dayjs.isDayjs(rowData[0])) {
										const dateTime = rowData[0].set('hour', hours).set('minute', minutes);
										rowData[0] = dateTime;
									}
								} else {
									rowData[1] = false;
								}
							} else {
								rowData.splice(1, 0, false);
							}
							tableData.push(rowData);
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

	const allGames = [...initGames];
	remainingMonths.forEach((month) => {
		month.map((game) => {
			allGames.push(game);
		});
	});

	return { allGames, league, year };
};
