'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
const mongoose_1 = __importDefault(require('mongoose'));
const models_1 = require('./models');
//import { Player2 } from "./models/Player2";
mongoose_1.default.connect('mongodb://localhost:27017/NBA').then(async () => {
	let game = await models_1.Game2.findOne().populate('home.team');
	console.log(game);
});
