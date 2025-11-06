const crypto = require('crypto');

function generateSignature(apiSecret, method, uri, timestamp) {
    const url = new URL(uri);
    const path = url.pathname + url.search;
    const hmac = crypto.createHmac('SHA256', apiSecret);

    hmac.update(`${method.toUpperCase()}${path}${timestamp}`);

    return hmac.digest('hex');
}

module.exports = { generateSignature };