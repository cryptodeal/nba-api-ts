import { loadSeasonsPage } from '../fetchers';

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
