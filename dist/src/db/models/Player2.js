"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player2 = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const slugger = __importStar(require("mongoose-slugger-plugin"));
mongoose_1.default.set('debug', true);
const Player2Schema = new mongoose_1.default.Schema({
    meta: {
        helpers: {
            espnPlayerId: { type: Number },
            nbaPlayerId: { type: Number },
            bballRef: {
                playerUrl: { type: String, required: true, unique: true }
            }
        },
        slug: { type: String }
    },
    name: {
        full: { type: String, required: true },
        display: { type: String },
        pronunciation: { type: String },
        nicknames: [{ type: String }],
        parsed: [{ type: String }]
    },
    birthDate: { type: Date },
    birthPlace: {
        city: { type: String },
        state: { type: String },
        country: { type: String }
    },
    highSchool: { type: String },
    college: { type: String },
    socials: {
        twitter: { type: String },
        instagram: { type: String }
    },
    height: {
        feet: { type: Number },
        inches: { type: Number }
    },
    weight: { type: Number },
    lastAffiliation: { type: String },
    position: { type: String },
    shoots: { type: String },
    draftYear: { type: String },
    draftRound: { type: String },
    draftNumber: { type: String },
    seasons: [
        {
            year: { type: Number },
            teams: [
                {
                    id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Team2', index: true },
                    startDate: { type: Date },
                    endDate: { type: Date }
                }
            ],
            position: { type: String },
            preseason: {
                exists: { type: Boolean, required: true, default: false },
                games: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Game2', many: true }],
                stats: {
                    games: { type: Number },
                    gamesStarted: { type: Number },
                    minutes: { type: Number },
                    fieldGoalsMade: { type: Number },
                    fieldGoalsAttempted: { type: Number },
                    fieldGoalsPct: { type: Number },
                    threePointersMade: { type: Number },
                    threePointersAttempted: { type: Number },
                    threePointersPct: { type: Number },
                    twoPointFGMade: { type: Number },
                    twoPointFGAttempted: { type: Number },
                    twoPointFGPct: { type: Number },
                    effectiveFieldGoalPct: { type: Number },
                    freeThrowsMade: { type: Number },
                    freeThrowsAttempted: { type: Number },
                    freeThrowsPct: { type: Number },
                    offReb: { type: Number },
                    defReb: { type: Number },
                    totalReb: { type: Number },
                    assists: { type: Number },
                    steals: { type: Number },
                    blocks: { type: Number },
                    turnovers: { type: Number },
                    personalFouls: { type: Number },
                    points: { type: Number }
                }
            },
            regularSeason: {
                exists: { type: Boolean, required: true, default: false },
                games: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Game2', many: true }],
                stats: {
                    games: { type: Number },
                    gamesStarted: { type: Number },
                    minutes: { type: Number },
                    fieldGoalsMade: { type: Number },
                    fieldGoalsAttempted: { type: Number },
                    fieldGoalsPct: { type: Number },
                    threePointersMade: { type: Number },
                    threePointersAttempted: { type: Number },
                    threePointersPct: { type: Number },
                    twoPointFGMade: { type: Number },
                    twoPointFGAttempted: { type: Number },
                    twoPointFGPct: { type: Number },
                    effectiveFieldGoalPct: { type: Number },
                    freeThrowsMade: { type: Number },
                    freeThrowsAttempted: { type: Number },
                    freeThrowsPct: { type: Number },
                    offReb: { type: Number },
                    defReb: { type: Number },
                    totalReb: { type: Number },
                    assists: { type: Number },
                    steals: { type: Number },
                    blocks: { type: Number },
                    turnovers: { type: Number },
                    personalFouls: { type: Number },
                    points: { type: Number }
                }
            },
            postseason: {
                exists: { type: Boolean, required: true, default: false },
                games: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Game2', many: true }],
                stats: {
                    games: { type: Number },
                    gamesStarted: { type: Number },
                    minutes: { type: Number },
                    fieldGoalsMade: { type: Number },
                    fieldGoalsAttempted: { type: Number },
                    fieldGoalsPct: { type: Number },
                    threePointersMade: { type: Number },
                    threePointersAttempted: { type: Number },
                    threePointersPct: { type: Number },
                    twoPointFGMade: { type: Number },
                    twoPointFGAttempted: { type: Number },
                    twoPointFGPct: { type: Number },
                    effectiveFieldGoalPct: { type: Number },
                    freeThrowsMade: { type: Number },
                    freeThrowsAttempted: { type: Number },
                    freeThrowsPct: { type: Number },
                    offReb: { type: Number },
                    defReb: { type: Number },
                    totalReb: { type: Number },
                    assists: { type: Number },
                    steals: { type: Number },
                    blocks: { type: Number },
                    turnovers: { type: Number },
                    personalFouls: { type: Number },
                    points: { type: Number }
                }
            }
        }
    ]
});
Player2Schema.statics = {
    findByPlayerUrl(playerUrl) {
        return this.findOne({
            'meta.helpers.bballRef.playerUrl': playerUrl
        }).exec();
    }
};
Player2Schema.index({ 'meta.slug': 1 }, { name: 'slug', unique: true });
Player2Schema.plugin(slugger.plugin, new slugger.SluggerOptions({
    // the property path which stores the slug value
    slugPath: 'meta.slug',
    // specify the properties which will be used for generating the slug
    generateFrom: ['name.full'],
    // the unique index, see above
    index: 'slug'
}));
const Player2 = slugger.wrap(mongoose_1.default.model('Player2', Player2Schema));
exports.Player2 = Player2;
