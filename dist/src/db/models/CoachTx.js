"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachTx = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const CoachTxSchema = new mongoose_1.default.Schema({
    date: { type: Date, required: true },
    season: { type: Number, required: true },
    team: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Team2', required: true },
    coach: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Coach2', required: true },
    action: { type: String, required: true },
    position: { type: String, required: true },
});
exports.CoachTx = mongoose_1.default.model("CoachTx", CoachTxSchema);
