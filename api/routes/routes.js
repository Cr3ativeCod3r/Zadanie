const express = require('express');
const axios = require('axios');
const { generateSignature } = require('../utils/signatureGenerator');

const router = express.Router();

const ENVIRONMENT_ID = process.env.ENVIRONMENT_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const ORGANIZATION_ID = process.env.ORGANIZATION_ID;
const BASE_API_URL = `https://${ORGANIZATION_ID}.cke-cs.com/api/v5/${ENVIRONMENT_ID}`;

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
function requireDocumentId(req, res, next) {
    const { document_id } = req.query;
    if (!document_id) {
        return res.status(400).json({ error: 'Missing required parameter: document_id' });
    }
    next();
}

router.delete('/flush', requireDocumentId, async (req, res) => {
    try {
        const { document_id } = req.query;
        const apiUrl = `${BASE_API_URL}/collaborations/${document_id}`;
        const result = await makeSignedRequest('DELETE', apiUrl);
        res.status(result.status).json(result.data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

router.get('/users', requireDocumentId, async (req, res) => {
    try {
        const { document_id } = req.query;
        const apiUrl = `${BASE_API_URL}/collaborations/${document_id}/users`;
        const result = await makeSignedRequest('GET', apiUrl);
        res.status(result.status).json(result.data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

router.get('/comments', requireDocumentId, async (req, res) => {
    try {
        const { document_id } = req.query;
        const apiUrl = `${BASE_API_URL}/comments?document_id=${document_id}`;
        const result = await makeSignedRequest('GET', apiUrl);
        res.status(result.status).json(result.data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

module.exports = router;