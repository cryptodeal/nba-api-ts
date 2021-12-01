"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPlayerBasicData = exports.addOrFindPlayer = void 0;
const Player2_1 = require("../../models/Player2");
const player_1 = require("../../../api/bballRef/player");
const addOrFindPlayer = async (playerData) => {
    const { playerUrl } = playerData.meta.helpers.bballRef;
    const result = await Player2_1.Player2.findByPlayerUrl(playerUrl);
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
        return new Player2_1.Player2(player)
            .save()
            .then((player) => {
            return player.save();
        })
            .catch((err) => {
            console.log(playerData);
            console.trace(err);
        });
    }
    else {
        return result;
    }
};
exports.addOrFindPlayer = addOrFindPlayer;
const addPlayerBasicData = (player) => {
    const { playerUrl } = player.meta.helpers.bballRef;
    return (0, player_1.getPlayerData)(playerUrl).then((data) => {
        const { height, weight, birthDate, birthPlace, position, shoots, name, college, socials } = data;
        if (height.feet) {
            player.height = {
                feet: height.feet
            };
        }
        if (height.inches)
            player.height.inches = height.inches;
        if (weight)
            player.weight = weight;
        if (birthDate)
            player.birthDate = birthDate;
        if (birthPlace)
            player.birthPlace = birthPlace;
        if (name.pronunciation)
            player.name.pronunciation = name.pronunciation;
        if (name.display)
            player.name.display = name.display;
        if (position)
            player.position = position;
        if (shoots)
            player.shoots = shoots;
        if (name?.display)
            player.name.display = name.display;
        if (college)
            player.college = college;
        if (socials?.twitter)
            player.socials.twitter = socials.twitter;
        if (socials?.instagram)
            player.socials.instagram = socials.instagram;
        return player.save();
    });
};
exports.addPlayerBasicData = addPlayerBasicData;
