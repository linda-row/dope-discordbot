const { sfetch } = require("./sfetch");
const { twitterMetricsLink } = require('../constants');
const { twitterBearerToken } = require("../config.json")

exports.getTwitterFollowers = async () => {
    const response = await sfetch(twitterMetricsLink, { headers: { authorization: twitterBearerToken } })
    if (!response) {
        return Promise.reject(response.statusText);
    }

    return response.data.public_metrics.followers_count;
}