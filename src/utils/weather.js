const WEATHER_ICONS = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  56: "",
  57: "",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  66: "",
  67: "",
  71: "🌨️",
  73: "🌨️",
  75: "❄️",
  77: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "🌩️",
};

export async function getWeatherForecast(lat, lon) {
  // fetch to specific model depends on coordinates (country)
  const model = await getWeatherModel(lat, lon);
  console.log(`getWeatherForecast from ${model} model`);
  const url = `https://api.open-meteo.com/v1/${model}?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();

  const forecast = {};
  data.daily.time.forEach((date, i) => {
    forecast[date] = {
      code: data.daily.weathercode[i],
      tMin: data.daily.temperature_2m_min[i],
      tMax: data.daily.temperature_2m_max[i],
    };
  });
  return forecast;
}

export async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        resolve({ lat: latitude, lon: longitude });
      },
      (err) => reject(err.message)
    );
  });
}

/**
 * Reverse geocode coordinates to get a country code,
 * then return the most appropriate Open-Meteo model.
 */
export async function getWeatherModel(lat, lon) {
  try {
    // --- Step 1: Reverse geocoding via OpenStreetMap (Nominatim)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await res.json();

    const countryCode = data.address?.country_code?.toUpperCase();
    console.log("Detected country:", countryCode);

    // --- Step 2: Map to Open-Meteo model
    const modelMap = {
      DE: "dwd", // 🇩🇪 Germany
      US: "noaa", // 🇺🇸 USA
      FR: "meteofrance", // 🇫🇷 France
      GB: "ukmo", // 🇬🇧 United Kingdom
      IE: "ukmo", // 🇮🇪 Ireland (UK Met Office covers)
      CH: "meteoswiss", // 🇨🇭 Switzerland
      NO: "metno", // 🇳🇴 Norway
      DK: "dmi", // 🇩🇰 Denmark
      IT: "italiameteo", // 🇮🇹 Italy
      NL: "knmi", // 🇳🇱 Netherlands
      CA: "gem", // 🇨🇦 Canada
      KR: "kma", // 🇰🇷 Korea
      JP: "jma", // 🇯🇵 Japan
      CN: "cma", // 🇨🇳 China
      AU: "bom", // 🇦🇺 Australia
    };

    // --- Step 3: Select model or fallback
    return modelMap[countryCode] || "ecmwf"; // fallback global model
  } catch (err) {
    console.error("getWeatherModel error:", err);
    return "ecmwf"; // fallback on failure
  }
}
