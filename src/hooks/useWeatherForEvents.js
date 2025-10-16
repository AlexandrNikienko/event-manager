import { getWeatherForecast, getUserLocation } from "../utils/weather";
import { getWeatherDescription } from "../components/WeatherIcons";

/**
 * Decorate events with weather info if they occur within the next 7 days (maximum weather API free package range)
 * @param {Array} events - event list
 * @param {number} activeYear - currently selected year in calendar
 * @param {number} daysAhead - how many days ahead to include weather (7)
 */
export async function decorateEventsWithWeather(events, activeYear, daysAhead = 7) {
  try {
    // Weather only makes sense for the current year
    const currentYear = new Date().getFullYear();
    if (activeYear !== currentYear) {
      return events; // skip weather for past/future years
    }

    const { lat, lon } = await getUserLocation();
    const forecast = await getWeatherForecast(lat, lon);
    const today = new Date();

    return events.map((ev) => {
      if (!ev.year || !ev.month || !ev.day) return ev;

      const dateStr = `${activeYear}-${String(ev.month).padStart(2, "0")}-${String(ev.day).padStart(2, "0")}`;
      const eventDate = new Date(dateStr);
      const diffDays = (eventDate - today) / (1000 * 60 * 60 * 24);

      if (diffDays >= -1 && diffDays <= daysAhead && forecast[dateStr]) {
        const code = forecast[dateStr].code;
        const wheatherTemp = `${forecast[dateStr].tMin}°–${forecast[dateStr].tMax}°`;
        const weatherDesc = getWeatherDescription(code);
        ev.weatherCode = code;
        ev.weatherTitle = `${wheatherTemp} ${weatherDesc}` || "";
        //console.log("Weather for", ev);
      }

      return ev;
    });
  } catch (err) {
    console.warn("Weather unavailable:", err);
    return events;
  }
}
