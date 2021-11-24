"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.League = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const LeagueSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: true },
    seasons: [
        {
            year: { type: Number, required: true },
            displaySeason: { type: String, required: true },
            games: {
                preseason: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Game2', many: true }],
                regularSeason: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Game2', many: true }],
                postSeason: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Game2', many: true }]
            },
            teams: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Team2', many: true }],
            awards: {
                mvp: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Player2' },
                roty: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Player2' },
                dpoy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Player2' },
                mostImproved: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Player2' },
                sixthMan: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Player2' }
            }
        }
    ]
});
exports.League = mongoose_1.default.model('League', LeagueSchema);
