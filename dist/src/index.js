"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./db/models");
const mongoose_gen_1 = require("./interfaces/mongoose.gen");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const init_1 = require("./db/init");
const game_1 = require("./api/bballRef/game");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
const testHelper = (game) => {
    /** Find date for boxscore query */
    const date = game.time == false
        ? (0, dayjs_1.default)(game?.date).format('YYYYMMDD')
        : (0, dayjs_1.default)(game?.date).tz('America/New_York').format('YYYYMMDD');
    if ((0, mongoose_gen_1.IsPopulated)(game.home.team) && (0, mongoose_gen_1.IsPopulated)(game.visitor.team)) {
        const homeSeasons = game.home.team.seasons;
        const visitorSeasons = game.visitor.team?.seasons;
        if (homeSeasons && visitorSeasons) {
            const homeIndex = homeSeasons.findIndex((s) => s.season === game.meta.helpers.bballRef.year);
            const visitorIndex = visitorSeasons.findIndex((s) => s.season === game.meta.helpers.bballRef.year);
            if (homeIndex > -1 && visitorIndex > -1) {
                const homeAbbrev = homeSeasons[homeIndex].infoCommon.abbreviation;
                const visitorAbbrev = visitorSeasons[visitorIndex].infoCommon.abbreviation;
                if (visitorAbbrev && homeAbbrev) {
                    return (0, game_1.getBoxScore)(date, homeAbbrev, visitorAbbrev);
                }
            }
        }
    }
};
(0, init_1.initConnect)()
    .then(async () => {
    const game = await models_1.Game2.findOne({
        'meta.helpers.bballRef.year': 2020
    }).populate('home.team visitor.team');
    if (game !== null)
        return testHelper(game);
})
    .then(console.log);
