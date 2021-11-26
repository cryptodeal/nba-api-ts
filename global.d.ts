declare namespace NodeJS {
	interface ProcessEnv {
		MONGO_PORT: string;
		MONGO_HOST: string;
    MONGO_DB: string;
	}
}
