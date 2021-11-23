'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
exports.Coach2 = void 0;
const mongoose_1 = __importDefault(require('mongoose'));
const Coach2Schema = new mongoose_1.default.Schema({
	//replaces firstName and lastName with name.first and name.last
	name: {
		first: { type: String, required: true, index: true },
		last: { type: String, required: true, index: true },
		full: { type: String, required: true, index: true }
	},
	seasons: [
		{
			season: { type: Number, required: true, index: true },
			team: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Team2', index: true },
			coachType: { type: String },
			preseason: {
				exists: { type: Boolean, required: true, index: true },
				games: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				stats: {
					games: { type: Number },
					wins: { type: Number },
					losses: { type: Number },
					winLossPct: { type: Number },
					winsOver500: { type: Number },
					finish: { type: Number }
				}
			}
		}
	]
});
exports.Coach2 = mongoose_1.default.model('Coach2', Coach2Schema);
