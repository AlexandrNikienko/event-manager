export const WEATHER_ICONS = {
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
  //const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
  const url = `https://api.open-meteo.com/v1/ecmwf?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
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
