import mongoose from 'mongoose';
import config from '../utils/config';

export const initConnect = () => {
	const mongooseURI = `mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}/${config.MONGO_DB}`;
	return mongoose.connect(mongooseURI, {}).then((mongoose) => {
		console.log(`🟢 Mongo db connected:`, mongoose.connection.host);
		return mongoose;
	});
};
