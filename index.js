const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file
const app = express();
const PORT = process.env.PORT || 3000;

// Access the token and base URL from environment variables
const TOKEN = process.env.TOKEN; 
const BASE_URL = process.env.BASE_URL; 

// Middleware for CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');
    next();
});

app.get('/playerData', async (req, res) => {
    const playerTag = req.query.playerTag;

    // Check if playerTag is provided and valid
    if (playerTag && /^[a-zA-Z0-9]+$/i.test(playerTag)) {
        const formattedTag = encodeURIComponent(playerTag.toUpperCase());
        const playerDataUrl = `${BASE_URL}players/%23${formattedTag}`;
        const upcomingChestsUrl = `${BASE_URL}players/%23${formattedTag}/upcomingchests`;
        const cardsUrl = `${BASE_URL}cards`;

        try {
            const playerData = await getDataFromServer(playerDataUrl);
            const upcomingChests = await getDataFromServer(upcomingChestsUrl);
            const cards = await getDataFromServer(cardsUrl);

            res.json([playerData, upcomingChests, cards]);
        } catch (error) {
            res.status(503).json({ error: 'Service Unavailable' });
        }
    } else {
        // If playerTag is not provided or invalid
        res.status(400).json({ error: 'Invalid or missing playerTag' });
    }
});

async function getDataFromServer(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${TOKEN}`,
            },
        });

        return response.data;
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        const message = status === 404 ? 'Not Found' : status === 403 ? 'Forbidden' : 'Error';
        throw new Error(message);
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
