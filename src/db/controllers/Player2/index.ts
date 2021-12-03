import { Player2 } from '../../models';
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
				return player.save();
			})
			.catch((err) => {
				console.log(playerData);
				console.trace(err);
			});
	} else {
		return result;
	}
};

export const addPlayerBasicData = (player: Player2Document) => {
	const { playerUrl } = player.meta.helpers.bballRef;
	return getPlayerData(playerUrl).then((data) => {
		const { height, weight, birthDate, birthPlace, position, shoots, name, college, socials } =
			data;
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
		if (name.display) player.name.display = name.display;
		if (position) player.position = position;
		if (shoots) player.shoots = shoots;
		if (name?.display) player.name.display = name.display;
		if (college) player.college = college;
		if (socials?.twitter) player.socials.twitter = socials.twitter;
		if (socials?.instagram) player.socials.instagram = socials.instagram;
		return player.save();
	});
};
