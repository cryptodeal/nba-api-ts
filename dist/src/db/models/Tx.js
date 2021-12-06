"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tx = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const TxSchema = new mongoose_1.default.Schema({
    date: { type: Date, required: true },
    season: { type: Number, required: true },
    participants: [{
            team: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Team2', index: true, required: true },
            received: {
                players: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Player2' }],
                coaches: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Coach2' }],
                assets: [{ type: String }]
            },
            spent: {
                players: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Player2' }],
                coaches: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Coach2' }],
                assets: [{ type: String }]
            }
        }]
});
exports.Tx = mongoose_1.default.model("Tx", TxSchema);
