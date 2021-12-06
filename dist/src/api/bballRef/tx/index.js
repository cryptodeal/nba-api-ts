"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeasonTx = void 0;
const fetchers_1 = require("../fetchers");
const dayjs_1 = __importDefault(require("dayjs"));
const getPlayerTx = ($) => {
    const p = $('#content').find('p').first();
    const start = (0, dayjs_1.default)($(p).find('strong').first().text().trim(), 'MMMM D, YYYY').toDate();
    $(p).find('strong').first().remove();
    const end = (0, dayjs_1.default)($(p).find('strong').first().text().trim(), 'MMMM D, YYYY').toDate();
    const seasonTxList = {
        start,
        end,
        txs: []
    };
    $('.page_index')
        .find('li')
        .each(function (i, li) {
        const date = (0, dayjs_1.default)($(li).find('span').text().trim(), 'MMMM D, YYYY');
        $(li)
            .find('p')
            .each(function (i, p) {
            const tx = {
                date: date.toDate(),
                details: $(p).text().trim(),
                players: [],
                coaches: [],
                teams: []
            };
            $(p)
                .find('a')
                .each(function (i, a) {
                const href = $(a).attr('href');
                if (href) {
                    const hrefSplit = href.split('/');
                    if (href.includes('coaches')) {
                        const coach = {
                            name: $(a).text().trim(),
                            url: hrefSplit[hrefSplit.length - 1].split('.')[0]
                        };
                        if (tx.coaches.findIndex((c) => c.url === coach.url) === -1)
                            tx.coaches.push(coach);
                        tx.coaches.push(coach);
                    }
                    else if (href.includes('players')) {
                        const player = {
                            name: $(a).text().trim(),
                            url: hrefSplit[hrefSplit.length - 1].split('.')[0]
                        };
                        if (tx.players.findIndex((p) => p.url === player.url) === -1)
                            tx.players.push(player);
                    }
                    else if (href.includes('teams')) {
                        const team = {
                            name: $(a).text().trim(),
                            url: hrefSplit[hrefSplit.length - 2]
                        };
                        if (tx.teams.findIndex((t) => t.url === team.url) === -1)
                            tx.teams.push(team);
                    }
                }
            });
            seasonTxList.txs.push(tx);
        });
    });
    return seasonTxList;
};
const getSeasonTx = async (league, season) => {
    const $ = await (0, fetchers_1.loadTx)(league, season);
    return getPlayerTx($);
};
exports.getSeasonTx = getSeasonTx;
