import React from 'react';

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  role: "img",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: "#4b89ec" 
};

function SunIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <defs>
        <linearGradient id="gSun" x1="0" x2="1">
          <stop offset="0%" stopColor="#FFD54A" />
          <stop offset="100%" stopColor="#FFB74D" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="4" strokeWidth="0" fill="url(#gSun)"/>
      <g stroke="#FFB74D">
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </g>
    </svg>
  );
}

function PartlyCloudyIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <g stroke="#FFB74D">
        <path d="M12 2v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="M20 12h2" />
        <path d="m19.07 4.93-1.41 1.41" />
        <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" />
      </g>
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
    </svg>
  );
}

function CloudyIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <path d="M17.5 21H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      <path d="M22 10a3 3 0 0 0-3-3h-2.207a5.502 5.502 0 0 0-10.702.5" />
    </svg>
  );
}

function CloudFogIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 17H7" />
      <path d="M17 21H9" />
    </svg>
  );
}

function CloudDrizzleIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
      <path d="M8 19v1"/>
      <path d="M8 14v1"/>
      <path d="M16 19v1"/>
      <path d="M16 14v1"/>
      <path d="M12 21v1"/>
      <path d="M12 16v1"/>
    </svg>
  );
}

function CloudRainIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 14v6" />
      <path d="M8 14v6" />
      <path d="M12 16v6" />
    </svg>
  );
}

function SnowIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <path d="m10 20-1.25-2.5L6 18" />
      <path d="M10 4 8.75 6.5 6 6" />
      <path d="m14 20 1.25-2.5L18 18" />
      <path d="m14 4 1.25 2.5L18 6" />
      <path d="m17 21-3-6h-4" />
      <path d="m17 3-3 6 1.5 3" />
      <path d="M2 12h6.5L10 9" />
      <path d="m20 10-1.5 2 1.5 2" />
      <path d="M22 12h-6.5L14 15" />
      <path d="m4 10 1.5 2L4 14" />
      <path d="m7 21 3-6-1.5-3" />
      <path d="m7 3 3 6h4" />
    </svg>
  );
}

function ThunderIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} {...iconProps}>
      <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
      <path stroke="#FFB74D" d="m13 12-3 5h4l-3 5" />
    </svg>
  );
}

const CODE_MAP = {
  Clear: [0], //sun
  MainlyClear: [1, 2, 3], //cloud-sun
  Fog: [45, 48], //cloud-fog
  Drizzle: [51, 53, 55, 56, 57], //cloud-drizzle
  Rain: [61, 63, 65, 80, 81, 82], //cloud-rain
  FreezingRain: [66, 67], //cloud-hail
  Snow: [71, 73, 75, 77, 85, 86], //snowflake
  Thunder: [95, 96, 99], //cloud-lightning
};

export const WEATHER_DESC = {
  0: "Clear sky",
  1: "Mainly clear, partly cloudy, and overcast",
  2: "Mainly clear, partly cloudy, and overcast",
  3: "Mainly clear, partly cloudy, and overcast",
  45: "Fog and depositing rime fog",
  48: "Fog and depositing rime fog",
  51: "Drizzle: Light, moderate, and dense intensity",
  53: "Drizzle: Light, moderate, and dense intensity",
  55: "Drizzle: Light, moderate, and dense intensity",
  56: "Freezing Drizzle: Light and dense intensity",
  57: "Freezing Drizzle: Light and dense intensity",
  61: "Rain: Slight, moderate and heavy intensity",
  63: "Rain: Slight, moderate and heavy intensity",
  65: "Rain: Slight, moderate and heavy intensity",
  66: "Freezing Rain: Light and heavy intensity",
  67: "Freezing Rain: Light and heavy intensity",
  71: "Snow fall: Slight, moderate, and heavy intensity",
  73: "Snow fall: Slight, moderate, and heavy intensity",
  75: "Snow fall: Slight, moderate, and heavy intensity",
  77: "Snow grains",
  80: "Rain showers: Slight, moderate, and violent",
  81: "Rain showers: Slight, moderate, and violent",
  82: "Rain showers: Slight, moderate, and violent",
  85: "Snow showers slight and heavy",
  86: "Snow showers slight and heavy",
  95: "Thunderstorm: Slight or moderate",
  96: "Thunderstorm with slight and heavy hail",
  99: "Thunderstorm with slight and heavy hail",
};

// export function WeatherIcon({ code, size = 26 }) {
//   if (CODE_MAP.Clear.includes(code)) return <Sun size={size} title={title || 'Clear'} />;
//   if (CODE_MAP.MainlyClear.includes(code)) return <PartlyCloudy size={size} title={title || 'Partly cloudy'} />;
//   if (CODE_MAP.Fog.includes(code)) return <Fog size={size} title={title || 'Fog'} />;
//   if (CODE_MAP.Drizzle.includes(code)) return <Rain size={size} title={title || 'Drizzle'} />;
//   if (CODE_MAP.Rain.includes(code)) return <Rain size={size} title={title || 'Rain'} />;
//   if (CODE_MAP.Snow.includes(code)) return <Snow size={size} title={title || 'Snow'} />;
//   if (CODE_MAP.Thunder.includes(code)) return <Thunder size={size} title={title || 'Thunderstorm'} />;
// }

export default function WeatherIcon({ code ,size }) {
  //console.log("WeatherIcon", code);
  if (code === 0) return <SunIcon size={size} />;
  if (code <= 2) return <PartlyCloudyIcon size={size} />;
  if (code <= 3) return <CloudyIcon size={size} />;
  if (code >= 45 && code <= 48) return <CloudFogIcon size={size} />;
  if (code >= 51 && code <= 57) return <CloudDrizzleIcon size={size} />;
  if (code >= 61 && code <= 67) return <CloudRainIcon size={size} />;
  if (code >= 71 && code <= 86) return <SnowIcon size={size} />;
  if (code >= 95) return <ThunderIcon size={size} />;
  return "";
};

export const getWeatherDescription = (code) => {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 86) return 'Snow';
  if (code >= 95) return 'Thunderstorm';
  return 'Unknown';
};
