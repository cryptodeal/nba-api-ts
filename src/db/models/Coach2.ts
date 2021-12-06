import mongoose from 'mongoose';
import { Coach2Document, Coach2Model, Coach2Schema } from '../interfaces/mongoose.gen';

const Coach2Schema = new mongoose.Schema({
	meta: {
		helpers: {
			bballRef: {
				coachUrl: { type: String, required: true }
			}
		}
	},
	name: {
		first: { type: String },
		last: { type: String },
		full: { type: String, required: true, index: true }
	},
	seasons: [
		{
			season: { type: Number, required: true, index: true },
			team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team2', index: true },
			coachType: { type: String },
			preseason: {
				exists: { type: Boolean, required: true, index: true },
				games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Game2', many: true }],
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

Coach2Schema.statics = {
	findByUrl(url: string) {
		return this.findOne({ 'meta.helpers.bballRef.coachUrl': url }).exec();
	}
};

export const Coach2: Coach2Model = mongoose.model<Coach2Document, Coach2Model>(
	'Coach2',
	Coach2Schema
);
