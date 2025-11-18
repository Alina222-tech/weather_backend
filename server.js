require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const NodeCache = require("node-cache");

const app = express();
const port = process.env.PORT || 5000;


app.use(cors({
    origin:"http://localhost:5173"
}));
app.use(express.json());


const cache = new NodeCache({ stdTTL: 600 });


app.get("/api/weather/:city", async (req, res) => {
  const city = req.params.city.toLowerCase();


  if (cache.has(city)) {
    return res.json({ source: "cache", data: cache.get(city) });
  }
console.log("API KEY:", process.env.OPENWEATHER_API_KEY);
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

 
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);


    cache.set(city, response.data);

    res.json({ source: "api", data: response.data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.listen(port, () => console.log(`Server running on port ${port}`));
