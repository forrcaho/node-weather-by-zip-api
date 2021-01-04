"use strict";

const express = require('express');
const app = express();
const router = express.Router();

// Set up Swagger UI
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./openapi.yml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Set up the API
const weatherbitClient = require('./weatherbitClient');
const getWeatherByZipCode = weatherbitClient.getWeatherByZipCode;
const getWeatherByMultiZipCodes = weatherbitClient.getWeatherByMultiZipCodes;

router.get('/weather', async (req, res, next) => {
    const zip = req.query.zip;
    if (! zip) {
        res.status(400).json("Required 'zip' parameter missing");
        console.log("API call made with required 'zip' parameter missing");
        return;
    }
    try {
        if (Array.isArray(zip)) {
            const results = await getWeatherByMultiZipCodes(zip);
            res.status(200).json(results);
        } else {
            const results = await getWeatherByZipCode(zip);
            if (results) {
                res.status(200).json(results);
            } else {
                res.status(204);
            }
        }
    } catch (error) {
        return next(error);
        // res.status(500).json('An error occurred');
        // console.error('Received error from weatherbit call: returned 500');
    }
});

app.use('/', router);

module.exports = app;