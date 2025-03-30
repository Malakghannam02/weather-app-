// weatherRoutes.js 
const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Fetch weather by city name
router.get("/weather/:city", async (req, res) => {
    const city = req.params.city;

    try {
        const response = await axios.get(`${BASE_URL}?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
        
        // Extract relevant data
        const weatherData = {
            city: response.data.name,
            temperature: response.data.main.temp,
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed
        };

        res.json(weatherData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching weather data" });
    }
});
module.exports = router;


