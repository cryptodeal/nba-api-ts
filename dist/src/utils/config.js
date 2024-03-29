"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Parsing the env file.
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
// Loading process.env as ENV interface
const getConfig = () => {
    return {
        MONGO_PORT: process.env.MONGO_PORT ? Number(process.env.MONGO_PORT) : undefined,
        MONGO_HOST: process.env.MONGO_HOST,
        MONGO_DB: process.env.MONGO_DB
    };
};
// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.
const getSanitzedConfig = (config) => {
    console.log(path_1.default.resolve(__dirname, '../.env'));
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in config.env`);
        }
    }
    return config;
};
const config = getConfig();
const verifiedConfig = getSanitzedConfig(config);
exports.default = verifiedConfig;
