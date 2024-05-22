const mapboxSdk = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mapboxSdk({ accessToken: 'sk.eyJ1Ijoic29ueWFsZW1lc2hvdmEiLCJhIjoiY2x1cTB3MXZsMG1hYjJtbnh4b3lsODdxYiJ9.yhUfYEBePivRIB1Dsu89uA' });
const express = require('express');
const router = express.Router();
const PointModel = require('../models/Point.models');

router.get('/cities', (req, res) => {
    const { query } = req.query; // Отримання параметра "query" з запиту
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    geocodingClient.forwardGeocode({
        query: query, // Використовуємо значення параметра "query"
        limit: 7, // Обмеження кількості результатів
        types: ['place'], // Фільтр за типом "place" (міста, містечка тощо)
        countries: ['UA'], // Обмеження до України (код ISO 3166-1 alpha-2)
    })
    .send()
    .then(response => {
        const features = response.body.features;
        const cities = features.map(feature => ({
            name: feature.place_name,
            coordinates: feature.geometry.coordinates,
        }));
        res.json(cities);
    })
    .catch(error => {
        console.error('Error searching for cities:', error);
        res.status(500).send('Error searching for cities');
    });
});

router.get('/neighborhoods', (req, res) => {
    const city = 'Kyiv, Ukraine'; // Отримання параметра "city" з запиту
    if (!city) {
        return res.status(400).json({ error: 'City parameter is required' });
    }

    geocodingClient.forwardGeocode({
        query: city, // Пошук районів для обраного міста в Україні
        limit: 10, // Обмеження кількості результатів
        types: ['neighborhood'], // Фільтр за типом "neighborhood" (райони)
        
        countries: ['UA'], // Обмеження до України (код ISO 3166-1 alpha-2)
    })
    .send()
    .then(response => {
        const features = response.body.features;
        const neighborhoods = features.map(feature => ({
            name: feature.text,
            coordinates: feature.geometry.coordinates,
        }));
        res.json(neighborhoods);
    })
    .catch(error => {
        console.error('Error searching for neighborhoods:', error);
        res.status(500).send('Error searching for neighborhoods');
    });
});
router.get('/neighborhood', (req, res) => {
    const { query } = req.query; // Отримання параметра "query" з запиту
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    geocodingClient.forwardGeocode({
        query: query, // Використовуємо значення параметра "query"
        limit: 7, // Обмеження кількості результатів
        types: ['neighborhood'], // Фільтр за типом "place" (міста, містечка тощо)
        countries: ['UA'], // Обмеження до України (код ISO 3166-1 alpha-2)
    })
    .send()
    .then(response => {
        const features = response.body.features;
        const cities = features.map(feature => ({
            name: feature.text,
            coordinates: feature.geometry.coordinates,
        }));
        res.json(cities);
    })
    .catch(error => {
        console.error('Error searching for cities:', error);
        res.status(500).send('Error searching for cities');
    });
});

module.exports = router;