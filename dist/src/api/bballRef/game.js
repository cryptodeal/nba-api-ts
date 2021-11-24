"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoxScore = void 0;
const fetchers_1 = require("./fetchers");
const cheerio_1 = __importDefault(require("cheerio"));
const mongoose_gen_1 = require("../../interfaces/mongoose.gen");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
class ParsedOfficial {
    constructor(name, url, jerseyNumber) {
        this.name = name;
        this.url = url;
        this.jerseyNumber = jerseyNumber;
        this.name = name;
        this.url = url;
        this.jerseyNumber = jerseyNumber;
    }
}
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
const parseGameOfficials = ($) => {
    const officials = [];
    $('strong:contains("Officials:")')
        .parent()
        .find('a')
        .each(function (i, link) {
        let url;
        const href = $(link).attr('href')?.split('/');
        if (href)
            url = href[href.length - 1].split('.')[0];
        const name = $(link).text().trim();
        const official = new ParsedOfficial(name, url);
        officials.push(official);
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
                    const rowData = [];
                    $(row)
                        .find('th')
                        .each(function (k, cell) {
                        const tempVal = [$(cell).text().trim()];
                        $(cell)
                            .find('a')
                            .each(function (l, link) {
                            const href = $(link).attr('href')?.split('/');
                            const url = href?.[href.length - 1].split('.')[0];
                            if (url)
                                tempVal.push(url);
                            if (url)
                                rowData[k] = tempVal;
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
const getBoxScore = async (game) => {
    const { date, homeAbbrev, visitorAbbrev, isValid } = new BoxScoreQuery(game);
    if (isValid && homeAbbrev) {
        const $ = await (0, fetchers_1.loadBoxScorePage)(date, homeAbbrev);
        //const officials = parseGameOfficials($);
        //const [visitorLineScore, homeLineScore] = parseLineScore($);
        const periods = parseGamePeriods($);
        return getBasicData($, homeAbbrev, periods);
    }
    return;
};
exports.getBoxScore = getBoxScore;
