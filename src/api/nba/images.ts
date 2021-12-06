import fetch from 'cross-fetch';
import { S3Client, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { Player2Document } from '../../db/interfaces/mongoose.gen';
import config from '../../../config';

const s3 = new S3Client({
	region: 'us-east-1',
	credentials: { accessKeyId: config.S3_ACCESS_KEY, secretAccessKey: config.S3_SECRET }
});

const getPlayerImage = async (playerId: string) => {
	return fetch(
		`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`
	).then((res) => {
		if (res.status !== 403) return res.arrayBuffer();
		throw new Error('');
	});
};

const transformImage = async (image: ArrayBuffer) => {
	const sharpInitImg = sharp(Buffer.from(image));
	sharpInitImg.metadata().then(function (metadata) {
		console.log(metadata);
	});
};

export const storePlayerImage = (player: Player2Document) => {
	if (player.meta.helpers.nbaPlayerId) {
		return getPlayerImage(`${player.meta.helpers.nbaPlayerId}`)
			.then((image) => {
				if (image) {
					return transformImage(image);
				}
			})
			.catch(console.log);
	}
};
