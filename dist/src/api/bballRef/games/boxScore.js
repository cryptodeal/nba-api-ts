"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedOfficial = void 0;
const fetchers_1 = require("../fetchers");
const cheerio_1 = __importDefault(require("cheerio"));
const mongoose_gen_1 = require("../../../interfaces/mongoose.gen");
const utils_1 = require("./utils");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
/** Useful Interfaces */
class ParsedOfficial {
    constructor(name, url, jerseyNumber) {
        this.name = name;
        this.url = url;
        this.jerseyNumber = jerseyNumber;
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
exports.ParsedOfficial = ParsedOfficial;
/** Query Helpers */
class BoxScoreQuery {
    constructor(game) {
        this.isValid = false;
        this.date =
            game.time == false
                ? (0, dayjs_1.default)(game?.date).format('YYYYMMDD')
                : (0, dayjs_1.default)(game?.date).tz('America/New_York').format('YYYYMMDD');
        /** Find Home Abbreviation for Season */
        if (game.home.team && (0, mongoose_gen_1.IsPopulated)(game.home.team)) {
            for (let i = 0; i < game.home.team.seasons.length; i++) {
                if (game.home.team.seasons[i].season === game.meta.helpers.bballRef.year) {
                    this.homeAbbrev = game.home.team.seasons[i].infoCommon.abbreviation;
                }
            }
        }
        /** Find Visitor Abbreviation for Season */
        if (game.visitor.team && (0, mongoose_gen_1.IsPopulated)(game.visitor.team)) {
            for (let j = 0; j < game.visitor.team.seasons.length; j++) {
                if (game.visitor.team.seasons[j].season === game.meta.helpers.bballRef.year) {
                    this.visitorAbbrev = game.visitor.team.seasons[j].infoCommon.abbreviation;
                }
            }
        }
        /** If valid query, isValid = True */
        if (this.homeAbbrev && this.date && this.visitorAbbrev)
            this.isValid = true;
    }
}
/** Boxscore Parsers */
const parseOfficials = ($) => {
    const officials = [];
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
const findLineScoreData = ($) => {
    $(`#all_line_score`).each(function (i, div) {
        $(div)
            .contents()
            .each(function () {
            if (this.type === 'comment') {
                const comment = this.data;
                if (comment)
                    $ = cheerio_1.default.load(comment);
            }
        });
    });
    return $;
};
/** takes linescore data loaded into cheerio and returns
 * [visitLineScore, homeLineScore], each formatted as
 * [Q1, Q2, Q3, Q4, OT, 2OT, ..., Total]
 */
const parseLineScore = ($) => {
    $ = findLineScoreData($);
    const tableData = [];
    $(`#line_score`).each(function (i, table) {
        $(table)
            .find('tbody')
            .each(function (i, tbody) {
            $(tbody)
                .find('tr')
                .each(function (j, row) {
                const rowData = [];
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
const parseGamePeriods = ($) => {
    const periods = [];
    $(`.switcher`).each(function (i, periodDiv) {
        $(periodDiv)
            .find('div')
            .each(function (i, period) {
            periods.push($(period).text().trim().toLowerCase());
        });
    });
    return periods;
};
const fetchTeamBasicData = ($, team, period) => {
    const tableData = [];
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
const getTeamBasicData = ($, team, periods) => {
    const allData = [];
    for (let i = 0; i < periods.length; i++) {
        allData.push(fetchTeamBasicData($, team, periods[i]));
    }
    return allData;
};
const fetchBasicData = ($, team, period) => {
    const tableData = [];
    $(`#box-${team}-${period}-basic`).each(function (i, table) {
        $(table)
            .find('tbody')
            .each(function (i, tbody) {
            $(tbody)
                .find('tr')
                .each(function (j, row) {
                if (j !== 5) {
                    const rowData = [[]];
                    $(row)
                        .find('th')
                        .each(function (k, cell) {
                        rowData[0].push($(cell).text().trim());
                        $(cell)
                            .find('a')
                            .each(function (l, link) {
                            const href = $(link).attr('href')?.split('/');
                            const url = href?.[href.length - 1].split('.')[0];
                            if (url)
                                rowData[0].push(url);
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
const getBasicData = ($, team, periods) => {
    const allData = [];
    for (let i = 0; i < periods.length; i++) {
        //if no data in allData, add initial data (totals)
        if (i == 0) {
            const initData = fetchBasicData($, team, periods[i]);
            initData.forEach((playerData) => {
                allData.push([playerData]);
            });
        }
        //if data in allData, merge with new data
        else {
            const periodData = fetchBasicData($, team, periods[i]);
            periodData.forEach((playerData, j) => {
                allData[j][i] = playerData;
            });
        }
    }
    return allData;
};
const getAdvancedData = ($, team) => {
    const tableData = [];
    $(`#box-${team}-game-advanced`).each(function (i, table) {
        $(table)
            .find('tbody')
            .each(function (i, tbody) {
            $(tbody)
                .find('tr')
                .each(function (j, row) {
                if (j !== 5) {
                    const rowData = [];
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
const getTeamAdvancedData = ($, team) => {
    const tableData = [];
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
const parseInactivePlayers = ($, homeAbbrev, visitorAbbrev) => {
    const inactive = {
        home: [],
        visitor: []
    };
    const selected = $('strong:contains("Inactive:")').parent();
    if (selected) {
        const [vSplit1, hSplit1] = selected.text().split(homeAbbrev);
        if (hSplit1?.length) {
            hSplit1.split(',').map((p) => {
                if (p.trim() !== 'None') {
                    const player = {
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
                    const player = {
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
                }
                else {
                    inactive.visitor[visitorIndex].url = href[href.length - 1].split('.')[0];
                }
            }
        });
    }
    return inactive;
};
const findFourFactors = ($) => {
    $(`#all_four_factors`).each(function (i, div) {
        $(div)
            .contents()
            .each(function () {
            if (this.type === 'comment') {
                const comment = this.data;
                if (comment)
                    $ = cheerio_1.default.load(comment);
            }
        });
    });
    return $;
};
const getFourFactor = ($) => {
    $ = findFourFactors($);
    const tableData = {
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
                const rowData = [];
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
const parseLocale = ($) => {
    if ($('.scorebox_meta').find('div').length > 2) {
        const [arena, city, state] = $('.scorebox_meta')
            .find('div:nth-child(2)')
            .text()
            .trim()
            .split(',');
        const tempLocale = {};
        if (arena && arena !== '')
            tempLocale.arena = arena.trim();
        if (city && city !== '')
            tempLocale.city = city.trim();
        if (state && state !== '')
            tempLocale.state = state.trim();
        return tempLocale;
    }
    return false;
};
const getBoxScore = async (game) => {
    const { date, homeAbbrev, visitorAbbrev, isValid } = new BoxScoreQuery(game);
    if (isValid && homeAbbrev && visitorAbbrev) {
        const $ = await (0, fetchers_1.loadBoxScorePage)(date, homeAbbrev);
        const boxScore = {
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
        if (officials.length)
            boxScore.officials = officials;
        if (locale !== undefined && typeof locale !== 'boolean')
            boxScore.locale = locale;
        const boxScoreResult = new utils_1.BoxScore(boxScore);
        for (let i = 0; i < boxScoreResult.home.players.length; i++) {
            await (0, utils_1.setPlayerId)(boxScoreResult.home.players[i]);
        }
        for (let j = 0; j < boxScoreResult.visitor.players.length; j++) {
            await (0, utils_1.setPlayerId)(boxScoreResult.visitor.players[j]);
        }
        if (boxScoreResult.officials) {
            for (let k = 0; k < boxScoreResult.officials?.length; k++) {
                await (0, utils_1.setOfficialId)(boxScoreResult.officials[k]);
            }
        }
        boxScoreResult.setTeamLeaders();
        return boxScoreResult;
    }
    return;
};
exports.default = getBoxScore;
