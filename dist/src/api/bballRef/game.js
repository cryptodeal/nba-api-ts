"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoxScore = void 0;
const fetchers_1 = require("./fetchers");
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
const getBoxScore = async (date, homeTeam, visitingTeam, num) => {
    const $ = await (0, fetchers_1.loadBoxScorePage)(date, homeTeam, num);
    return parseGameOfficials($);
};
exports.getBoxScore = getBoxScore;
