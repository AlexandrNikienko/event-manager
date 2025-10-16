import { getWeatherForecast, getUserLocation } from "../utils/weather";
import { getWeatherDescription } from "../components/WeatherIcons";

/**
 * Decorate events with weather info if they occur within the next 7 days (maximum weather API free package range)
 * @param {Array} events - event list
 * @param {number} activeYear - currently selected year in calendar
 * @param {number} daysAhead - how many days ahead to include weather (7)
 */

let cachedForecast = null;
let cachedLocation = null;
let cachedDate = null;

export async function decorateEventsWithWeather(events, activeYear, daysAhead = 7) {
  try {
    const currentYear = new Date().getFullYear();
    if (activeYear !== currentYear) {
      return events;
    }

    const today = new Date().toISOString().split("T")[0];
    const cacheIsFresh = cachedForecast && cachedDate === today;

    if (!cacheIsFresh) {
      cachedLocation = await getUserLocation();
      cachedForecast = await getWeatherForecast(cachedLocation.lat, cachedLocation.lon);
      cachedDate = today;
      console.log("🌤️ Weather fetched & cached");
    } else {
      console.log("⚡ Using cached weather data");
    }

    const forecast = cachedForecast;

    return events.map((ev) => {
      if (!ev.year || !ev.month || !ev.day) return ev;

      const dateStr = `${activeYear}-${String(ev.month).padStart(2, "0")}-${String(ev.day).padStart(2, "0")}`;
      const eventDate = new Date(dateStr);
      const diffDays = (eventDate - new Date()) / (1000 * 60 * 60 * 24);

      if (diffDays >= -1 && diffDays <= daysAhead && forecast[dateStr]) {
        const { code, tMin, tMax } = forecast[dateStr];
        ev.weatherCode = code;
        ev.weatherTitle = `${tMin}°–${tMax}° ${getWeatherDescription(code)}`;
      }

      return ev;
    });
  } catch (err) {
    console.warn("Weather unavailable:", err);
    return events;
  }
}

