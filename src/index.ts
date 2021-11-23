import mongoose from 'mongoose';
import { Game2 } from './models';
//import { Player2 } from "./models/Player2";

mongoose.connect('mongodb://localhost:27017/NBA').then(async () => {
	const game = await Game2.findOne().populate('home.team');
	console.log(game);
});
