import path from 'path';
import dotenv from 'dotenv';

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
	MONGO_PORT: number | undefined;
	MONGO_HOST: string | undefined;
	MONGO_DB: string | undefined;
}

interface Config {
	MONGO_PORT: number;
	MONGO_HOST: string;
	MONGO_DB: string;
}

// Loading process.env as ENV interface

const getConfig = (): ENV => {
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

const getSanitzedConfig = (config: ENV): Config => {
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
