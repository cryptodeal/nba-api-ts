import { Official2 } from '../../models';
import { Official2Document } from '../../interfaces/mongoose.gen';
import { ParsedOfficial } from '../../../api/bballRef/games/boxScore';

export const addOrFindOfficial = async (official: ParsedOfficial) => {
	const { url, name } = official;
	const result: Official2Document = await Official2.findByUrl(url);
	if (!result) {
		const tempOfficial = {
			meta: {
				helpers: {
					bballRef: {
						officialUrl: url
					}
				}
			},
			name: {
				full: name
			}
		};
		return new Official2(tempOfficial)
			.save()
			.then((tempOfficial) => {
				return tempOfficial;
			})
			.catch((err) => {
				console.trace(err);
			});
	} else {
		return result;
	}
};
