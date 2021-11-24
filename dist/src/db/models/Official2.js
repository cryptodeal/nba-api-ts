"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Official2 = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Official2Schema = new mongoose_1.default.Schema({
    meta: {
        helpers: {
            nbaOfficialId: { type: Number },
            bballRef: {
                officialUrl: { type: String, required: true, unique: true }
            }
        }
    },
    name: {
        full: { type: String, required: true }
    },
    seasons: [
        {
            year: { type: Number },
            preseason: {
                exists: { type: Boolean, required: true, default: false },
                games: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Game2', many: true }]
            },
            regularSeason: {
                exists: { type: Boolean, required: true, default: false },
                games: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Game2', many: true }]
            },
            postseason: {
                exists: { type: Boolean, required: true, default: false },
                games: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Game2', many: true }]
            }
        }
    ]
});
Official2Schema.statics = {
    findByUrl(url) {
        return this.find({ 'meta.helpers.bballRef.officialUrl': url }).exec();
    },
    findByName(name) {
        return this.find({ 'name.full': name }).exec();
    }
};
exports.Official2 = mongoose_1.default.model('Official2', Official2Schema);
