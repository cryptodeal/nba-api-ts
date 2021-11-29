"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../../config"));
const initConnect = () => {
    const mongooseURI = `mongodb://${config_1.default.MONGO_HOST}:${config_1.default.MONGO_PORT}/${config_1.default.MONGO_DB}`;
    return mongoose_1.default.connect(mongooseURI, {}).then((mongoose) => {
        console.log(`🟢 Mongo db connected:`, mongoose.connection.host);
        return mongoose;
    });
};
exports.initConnect = initConnect;
