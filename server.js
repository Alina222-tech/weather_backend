import axios from "axios";
import NodeCache from "node-cache";

// Cache for 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

export default async function handler(req, res) {
  // Allow CORS (frontend can call this API)
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ message: "City is required" });
  }

  const cityLower = city.toLowerCase();

  // Return cached data if available
  if (cache.has(cityLower)) {
    return res.status(200).json({ source: "cache", data: cache.get(cityLower) });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: "API key is not set" });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityLower}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);

    // Cache the response
    cache.set(cityLower, response.data);

    res.status(200).json({ source: "api", data: response.data });
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    res.status(500).json({ message });
  }
}
