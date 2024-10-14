// netlify/functions/playerData.js

const axios = require('axios');
require('dotenv').config();

exports.handler = async (event, context) => {
    const playerTag = event.queryStringParameters.playerTag;

    // Check if playerTag is provided and valid
    if (playerTag && /^[a-zA-Z0-9]+$/i.test(playerTag)) {
        const formattedTag = encodeURIComponent(playerTag.toUpperCase());
        const BASE_URL = process.env.BASE_URL;
        const TOKEN = process.env.TOKEN; 
        
        const playerDataUrl = `${BASE_URL}players/%23${formattedTag}`;
        const upcomingChestsUrl = `${BASE_URL}players/%23${formattedTag}/upcomingchests`;
        const cardsUrl = `${BASE_URL}cards`;

        try {
            const playerData = await getDataFromServer(playerDataUrl, TOKEN);
            const upcomingChests = await getDataFromServer(upcomingChestsUrl, TOKEN);
            const cards = await getDataFromServer(cardsUrl, TOKEN);

            return {
                statusCode: 200,
                body: JSON.stringify([playerData, upcomingChests, cards]),
            };
        } catch (error) {
            return {
                statusCode: 503,
                body: JSON.stringify({ error: 'Service Unavailable' }),
            };
        }
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid or missing playerTag' }),
        };
    }
};

async function getDataFromServer(url, token) {
    const response = await axios.get(url, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
}
