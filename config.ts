import path from 'path';
import dotenv from 'dotenv';
import { SeasonGameItem } from './src/api/bballRef/seasons';

// Parsing the env file.
dotenv.config({
	path: path.resolve(
		__dirname,
		`${path.dirname(__dirname).includes('nba-api-ts') ? '../.env' : '.env'}`
	)
});

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
	MONGO_PORT: number | undefined;
	MONGO_HOST: string | undefined;
	MONGO_DB: string | undefined;
	S3_ACCESS_KEY: string | undefined;
	S3_SECRET: string | undefined;
}

interface Config {
	MONGO_PORT: number;
	MONGO_HOST: string;
	MONGO_DB: string;
	S3_ACCESS_KEY: string;
	S3_SECRET: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
	return {
		MONGO_PORT: process.env.MONGO_PORT ? Number(process.env.MONGO_PORT) : undefined,
		MONGO_HOST: process.env.MONGO_HOST,
		MONGO_DB: process.env.MONGO_DB,
		S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
		S3_SECRET: process.env.S3_SECRET
	};
};

// Throwing an Error if any field was undefined we don't
// want our app to run if it can't connect to DB and ensure
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type
// definition.

const getSanitzedConfig = (config: ENV): Config => {
	console.log('__dirname:', __dirname);
	console.log(
		path.resolve(
			__dirname,
			`${path.dirname(__dirname).includes('nba-api-ts') ? '../.env' : 'nba-api-ts/.env'}`
		)
	);
	for (const [key, value] of Object.entries(config)) {
		if (value === undefined) {
			throw new Error(`Missing key ${key} in config.env`);
		}
	}
	return config as Config;
};

const config = getConfig();

const verifiedConfig = getSanitzedConfig(config);

export default verifiedConfig;
