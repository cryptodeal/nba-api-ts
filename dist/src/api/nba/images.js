"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storePlayerImage = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const client_s3_1 = require("@aws-sdk/client-s3");
const sharp_1 = __importDefault(require("sharp"));
const config_1 = __importDefault(require("../../../config"));
const s3 = new client_s3_1.S3Client({
    region: 'us-east-1',
    credentials: { accessKeyId: config_1.default.S3_ACCESS_KEY, secretAccessKey: config_1.default.S3_SECRET }
});
const getPlayerImage = async (playerId) => {
    return (0, cross_fetch_1.default)(`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`).then((res) => {
        if (res.status !== 403)
            return res.arrayBuffer();
        throw new Error('');
    });
};
const transformImage = async (image) => {
    const sharpInitImg = (0, sharp_1.default)(Buffer.from(image));
    sharpInitImg.metadata().then(function (metadata) {
        console.log(metadata);
    });
};
const storePlayerImage = (player) => {
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
exports.storePlayerImage = storePlayerImage;
