"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTeamIndex = exports.loadTeamPage = exports.loadPlayoffSchedule = exports.loadSeasonSchedule = exports.loadPlayerPage = exports.loadSeasonsPage = exports.loadBoxScorePage = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const cheerio_1 = __importDefault(require("cheerio"));
/**
 * base url to build API requests
 */
const baseUrl = 'https://www.basketball-reference.com';
const loadBoxScorePage = (date, homeTeam, num) => {
    const url = num !== undefined
        ? `${baseUrl}/boxscores/${date}${num}${homeTeam}.html`
        : `${baseUrl}/boxscores/${date}0${homeTeam}.html`;
    return (0, cross_fetch_1.default)(url).then(async (result) => {
        const body = await result.text();
        return cheerio_1.default.load(body);
    });
};
exports.loadBoxScorePage = loadBoxScorePage;
const loadSeasonsPage = () => {
    return (0, cross_fetch_1.default)(`${baseUrl}/leagues/`).then(async (result) => {
        const body = await result.text();
        return cheerio_1.default.load(body);
    });
};
exports.loadSeasonsPage = loadSeasonsPage;
const loadPlayerPage = (playerUrl) => {
    return (0, cross_fetch_1.default)(`${baseUrl}/${playerUrl.slice(0, 1)}/${playerUrl}.html`).then(async (result) => {
        const body = await result.text();
        return cheerio_1.default.load(body);
    });
};
exports.loadPlayerPage = loadPlayerPage;
const loadSeasonSchedule = (league, year, month) => {
    const url = month
        ? `${baseUrl}/leagues/${league}_${year}_games-${month}.html`
        : `${baseUrl}/leagues/${league}_${year}_games.html`;
    return (0, cross_fetch_1.default)(url).then(async (result) => {
        const body = await result.text();
        return cheerio_1.default.load(body);
    });
};
exports.loadSeasonSchedule = loadSeasonSchedule;
const loadPlayoffSchedule = (league, year) => {
    return (0, cross_fetch_1.default)(`${baseUrl}/playoffs/${league}_${year}_games.html`).then(async (result) => {
        const body = await result.text();
        return cheerio_1.default.load(body);
    });
};
exports.loadPlayoffSchedule = loadPlayoffSchedule;
const loadTeamPage = (teamAbbr, year) => {
    return (0, cross_fetch_1.default)(`${baseUrl}/teams/${teamAbbr}/${year}.html`).then(async (result) => {
        const body = await result.text();
        return cheerio_1.default.load(body);
    });
};
exports.loadTeamPage = loadTeamPage;
const testTeamIndexRedirect = ($) => {
    const test = {
        valid: true,
        redirectTo: ''
    };
    $('meta').each(function (i, meta) {
        if (i == 1) {
            if ($(meta).attr('http-equiv') && $(meta).attr('content') !== undefined) {
                test.valid = false;
                const content = $(meta).attr('content');
                if (content)
                    test.redirectTo = content.split('/')[2];
            }
        }
    });
    return test;
};
const loadTeamIndex = (teamAbbr) => {
    return (0, cross_fetch_1.default)(`${baseUrl}/teams/${teamAbbr}/`).then(async (res) => {
        const body = await res.text();
        const $ = cheerio_1.default.load(body);
        const { valid, redirectTo } = testTeamIndexRedirect($);
        if (!valid)
            return (0, exports.loadTeamIndex)(redirectTo);
        return $;
    });
};
exports.loadTeamIndex = loadTeamIndex;
