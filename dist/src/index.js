"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import mongoose from 'mongoose';
const boxscore_1 = require("./api/bballRef/boxscore");
//import { Player2 } from "./models/Player2";
(0, boxscore_1.loadBoxScorePage)('20211119', 'BOS').then(console.log);
