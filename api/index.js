require('dotenv').config({ path: '../.env' });

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = 9001;

const ENVIRONMENT_ID = process.env.ENVIRONMENT_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const ORGANIZATION_ID = process.env.ORGANIZATION_ID;
const BASE_API_URL = `https://${ORGANIZATION_ID}.cke-cs.com/api/v5/${ENVIRONMENT_ID}`;

app.use(express.json());

function generateSignature(apiSecret, method, uri, timestamp) {
    const url = new URL(uri);
    const path = url.pathname + url.search;
    const hmac = crypto.createHmac('SHA256', apiSecret);

    hmac.update(`${method.toUpperCase()}${path}${timestamp}`);

    return hmac.digest('hex');
}

async function makeSignedRequest(method, url) {
    const timestamp = Date.now();

    const config = {
        method,
        url,
        headers: {
            'X-CS-Timestamp': timestamp,
            'X-CS-Signature': generateSignature(SECRET_KEY, method, url, timestamp),
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await axios(config);
        return { status: response.status, data: response.data };
    } catch (error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        throw error;
    }
}


app.delete('/flush', async (req, res) => {
    try {
        const { document_id } = req.query;
        const apiUrl = `${BASE_API_URL}/collaborations/${document_id}`;
        const result = await makeSignedRequest('DELETE', apiUrl);
        res.status(result.status).json(result.data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.get('/users', async (req, res) => {
    try {
        const { document_id } = req.query;
        const apiUrl = `${BASE_API_URL}/collaborations/${document_id}/users`;
        const result = await makeSignedRequest('GET', apiUrl);
        res.status(result.status).json(result.data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.get('/comments', async (req, res) => {
    try {
        const { document_id } = req.query;
        const apiUrl = `${BASE_API_URL}/comments?document_id=${document_id}`;
        const result = await makeSignedRequest('GET', apiUrl);
        res.status(result.status).json(result.data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});