import { initConnect } from './db/init';
//import { Player2 } from './db/models/Player2';
import { importBoxScores } from './db/controllers/Game2';

initConnect().then(async () => {
	importBoxScores();
});
