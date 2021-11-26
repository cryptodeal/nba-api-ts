import mongoose from 'mongoose';
import { LeagueDocument, LeagueModel, LeagueSchema } from '../interfaces/mongoose.gen';

const LeagueSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	seasons: [
		{
			year: { type: Number, required: true },
			displaySeason: { type: String, required: true },
			games: {
				preseason: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				regularSeason: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
				postSeason: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }]
			},
			teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team2', many: true }],
			awards: {
				mvp: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' },
				roty: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' },
				dpoy: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' },
				mostImproved: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' },
				sixthMan: { type: mongoose.Schema.Types.ObjectId, ref: 'Player2' }
			}
		}
	]
});

export const League: LeagueModel = mongoose.model<LeagueDocument, LeagueModel>(
	'League',
	LeagueSchema
);
