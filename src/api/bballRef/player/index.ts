import { loadPlayerPage } from '../fetchers';
import { findByAlpha2 } from 'iso-3166-1-ts';

interface BirthLocale {
	city: string;
	country: string;
	state?: string;
}

interface PlayerName {
	display: string;
	pronunciation?: string;
}

interface PlayerSocials {
	twitter?: string;
	instagram?: string;
}

export type PlayerMetaData = {
	height: {
		feet?: number;
		inches?: number;
	};
	weight?: number;
	birthDate?: Date;
	birthPlace?: BirthLocale;
	position?: string;
	shoots?: string;
	name: PlayerName;
	college?: string;
	socials?: PlayerSocials;
};

const findPlayerMeta = ($: cheerio.Root) => {
	const name: PlayerName = {
		display: $('#meta').find("*[itemprop = 'name']").text()
	};
	const height = $("*[itemprop = 'height']").text().trim().split('-');
	const weight = $("*[itemprop = 'weight']").text().trim();
	const birthDate = $("*[itemprop = 'birthDate']").attr('data-birth')?.split('-');
	const birthPlaceData = $("*[itemprop = 'birthPlace']")
		.text()
		.trim()
		.substring(3, $("*[itemprop = 'birthPlace']").text().trim().length)
		.split(',');
	const birthCountry = $('.f-i').text().trim();
	const birthPlace: BirthLocale = {
		city: birthPlaceData[0],
		country: ''
	};
	if (birthCountry !== undefined && findByAlpha2(birthCountry)?.name) {
		const country = findByAlpha2(birthCountry)?.name;
		if (country) birthPlace.country = country;
	}
	if (birthCountry == 'us') birthPlace.state = birthPlaceData[1]?.trim();
	const playerMeta: PlayerMetaData = {
		height: {
			feet: parseInt(height[0]),
			inches: parseInt(height[1])
		},
		weight: parseInt(weight.substring(0, weight.length - 2)),
		birthPlace,
		name
	};
	if (birthDate) {
		playerMeta.birthDate = new Date(
			parseInt(birthDate[0]),
			parseInt(birthDate[1]) - 1,
			parseInt(birthDate[2])
		);
	}

	/**
	 * search for specific info in player meta
	 * add any info to playerMeta object  */

	$(`#meta`).each(function (i, item) {
		$(item)
			.find('p')
			.each(function (i, p) {
				const itemText = $(p).text().trim();
				if (itemText.includes('Pronunciation: '))
					playerMeta.name.pronunciation = itemText.replace(/Pronunciation:/g, '').trim();
				if (itemText.includes('College:'))
					playerMeta.college = itemText.replace(/College:/g, '').trim();
				if (itemText.includes('▪')) {
					const itemSplit = itemText
						.split('▪')
						.map((item) => {
							item.trim();
							return item.split('\n').map((item) => item.trim());
						})
						.flat()
						.filter((i) => i !== '');
					if (itemText.includes('Position:') || itemText.includes('Shoots: ')) {
						if (itemSplit[0].includes('Position:')) {
							playerMeta.position = itemSplit[1];
						} else if (itemSplit[0].includes('Shoots:')) {
							playerMeta.shoots = itemSplit[1];
						}

						if (itemSplit[2].includes('Position:')) {
							playerMeta.position = itemSplit[3];
						} else if (itemSplit[2].includes('Shoots:')) {
							playerMeta.shoots = itemSplit[3];
						}
					} else {
						if (itemSplit.includes('Twitter:') || itemSplit.includes('Instagram')) {
							itemSplit.forEach((item, x) => {
								if (item.includes('Twitter:')) {
									if (playerMeta.socials == undefined) {
										playerMeta.socials = {};
									}
									playerMeta.socials.twitter = itemSplit[x + 1];
								}
								if (item.includes('Instagram:')) {
									if (playerMeta.socials == undefined) {
										playerMeta.socials = {};
									}
									playerMeta.socials.instagram = itemSplit[x + 1];
								}
							});
						}
					}
				}
			});
	});
	return playerMeta;
};

export const getPlayerData = async (playerUrl: string) => {
	const $ = await loadPlayerPage(playerUrl);
	return findPlayerMeta($);
};
