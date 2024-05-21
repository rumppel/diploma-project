const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');

router.use(
    '/api',
        createProxyMiddleware({
            target: 'https://imagesbucketdimpoma.s3.eu-north-1.amazonaws.com',
            changeOrigin: true,
        })
);

module.exports = router;