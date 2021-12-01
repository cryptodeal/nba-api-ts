"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeasonGames = exports.getSeasons = void 0;
const fetchers_1 = require("../fetchers");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
const parseSeasons = ($) => {
    const tableData = [];
    $(`#stats`).each(function (i, table) {
        $(table)
            .find('tbody')
            .each(function (i, tbody) {
            $(tbody)
                .find('tr')
                .each(function (j, row) {
                if (j > 1) {
                    const champion = $(row).find('[data-stat=champion]').text().trim();
                    const season = {
                        displaySeason: $(row).find('[data-stat=season]').text().trim(),
                        leagueStr: $(row).find('[data-stat=lg_id]').text().trim(),
                        mvp: [],
                        roty: []
                    };
                    if (champion)
                        season.champion = champion;
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
                                const mvpPlayer = {
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
                                const rotyPlayer = {
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
                                const ptsLeader = {
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
                                const trbLeader = {
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
                                const astLeader = {
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
                                const wsLeader = {
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
const getSeasons = async () => {
    const $ = await (0, fetchers_1.loadSeasonsPage)();
    return parseSeasons($);
};
exports.getSeasons = getSeasons;
const parseSeasonMonths = ($) => {
    const months = [];
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
const parseSeasonGames = ($) => {
    const tableData = [];
    $(`#schedule`).each(function (i, table) {
        $(table)
            .find('tbody')
            .each(function (i, tbody) {
            $(tbody)
                .find('tr')
                .each(function (j, row) {
                if ($(row).attr('class') !== 'thead') {
                    const game = {
                        date: (0, dayjs_1.default)($(row).find('[data-stat=date_game]').text().trim()),
                        time: false,
                        home: {
                            name: $(row).find('[data-stat=home_team_name]').text().trim()
                        },
                        visitor: {
                            name: $(row).find('[data-stat=visitor_team_name]').text().trim()
                        }
                    };
                    /** if exists, set visitor team score */
                    $(row)
                        .find('[data-stat=visitor_pts]')
                        .each(function (i, score) {
                        const visitorScore = $(score).text().trim();
                        if (visitorScore !== '') {
                            game.visitor.score = parseInt(visitorScore);
                        }
                    });
                    /** set visitor team abbreviation */
                    $(row)
                        .find('[data-stat=visitor_team_name]')
                        .each(function (i, score) {
                        $(score)
                            .find('a')
                            .each(function (i, a) {
                            const href = $(a).attr('href')?.split('/');
                            if (href) {
                                game.visitor.abbreviation = href[href.length - 2];
                            }
                        });
                    });
                    /** if exists, set home team score */
                    $(row)
                        .find('[data-stat=home_pts]')
                        .each(function (i, score) {
                        const homeScore = $(score).text().trim();
                        if (homeScore !== '') {
                            game.home.score = parseInt(homeScore);
                        }
                    });
                    /** set home team abbreviation */
                    $(row)
                        .find('[data-stat=home_team_name]')
                        .each(function (i, score) {
                        $(score)
                            .find('a')
                            .each(function (i, a) {
                            const href = $(a).attr('href')?.split('/');
                            if (href) {
                                game.home.abbreviation = href[href.length - 2];
                            }
                        });
                    });
                    /** if exists, set overtime count */
                    $(row)
                        .find('[data-stat=overtimes]')
                        .each(function (i, overtimes) {
                        const ot = $(overtimes).text().trim();
                        if (ot !== '')
                            game.otCount = ot;
                    });
                    /** if exists, set attendance */
                    $(row)
                        .find('[data-stat=attendance]')
                        .each(function (i, attendance) {
                        const attend = $(attendance).text().trim();
                        if (attend !== '')
                            game.attendance = parseInt(attend);
                    });
                    /** if exists, set attendance */
                    $(row)
                        .find('[data-stat=game_remarks]')
                        .each(function (i, remarks) {
                        const notes = $(remarks).text().trim();
                        if (notes !== '')
                            game.notes = notes;
                    });
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
                            if (halfOfDay === 'p') {
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
const getSeasonGames = async (league, year) => {
    const $ = await (0, fetchers_1.loadSeasonSchedule)(league, year);
    const months = parseSeasonMonths($);
    const initGames = parseSeasonGames($);
    const remainingMonths = await Promise.all(months.map((month) => {
        return (0, fetchers_1.loadSeasonSchedule)(league, year, month).then(($) => {
            return parseSeasonGames($);
        });
    }));
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
exports.getSeasonGames = getSeasonGames;
