import { Player2 } from '../../models/Player2';
import { Player2Document } from '../../interfaces/mongoose.gen';
import { BoxScorePlayer } from '../../../api/bballRef/games/utils';
import { getPlayerData } from '../../../api/bballRef/player';

export const addOrFindPlayer = async (playerData: BoxScorePlayer) => {
	const { playerUrl } = playerData.meta.helpers.bballRef;
	const result: Player2Document = await Player2.findByPlayerUrl(playerUrl);
	if (!result) {
		const player = {
			meta: {
				helpers: {
					bballRef: {
						playerUrl: playerUrl
					}
				}
			},
			name: {
				full: playerData.fullName
			}
		};
		return new Player2(player)
			.save()
			.then((player) => {
				return player;
			})
			.catch((err) => {
				console.trace(err);
			});
	} else {
		return result;
	}
};

export const addPlayerBasicData = (player: Player2Document) => {
	return getPlayerData(player.meta.helpers.bballRef.playerUrl).then((data) => {
		const { height, weight, birthDate, birthPlace, position, shoots, name, college, socials } =
			data;
		console.log(college);
		if (height.feet) {
			player.height = {
				feet: height.feet
			};
		}
		if (height.inches) player.height.inches = height.inches;
		if (weight) player.weight = weight;
		if (birthDate) player.birthDate = birthDate;
		if (birthPlace) player.birthPlace = birthPlace;
		if (name.pronunciation) player.name.pronunciation = name.pronunciation;
		if (position) player.position = position;
		if (shoots) player.shoots = shoots;
		if (name?.display) player.name.display = name.display;
		if (socials?.twitter) player.socials.twitter = socials.twitter;
		if (socials?.instagram) player.socials.instagram = socials.instagram;
		return player.save();
	});
};
