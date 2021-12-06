"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrFindOfficial = void 0;
const models_1 = require("../../models");
const addOrFindOfficial = async (official) => {
    const { url, name } = official;
    const result = await models_1.Official2.findByUrl(url);
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
        return new models_1.Official2(tempOfficial)
            .save()
            .then((tempOfficial) => {
            return tempOfficial;
        })
            .catch((err) => {
            console.trace(err);
        });
    }
    else {
        return result;
    }
};
exports.addOrFindOfficial = addOrFindOfficial;
