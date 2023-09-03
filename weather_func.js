const axios = require("axios");

async function getWeather(apiKey, city) {
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`
    );
    const weatherData = response.data;
    return weatherData;
  } catch (err) {
    console.log(err);
  }
}

module.exports = { getWeather };
