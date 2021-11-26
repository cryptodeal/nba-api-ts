import { initConnect } from './db/init';
import { importBoxScores } from './db/controllers/Game2';

initConnect()
	.then(async () => {
		return importBoxScores();
	})
	.then(console.log);
