export const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function daysInMonth(month, year) {
  // month: 1..12
  // new Date(year, month, 0).getDate() returns number of days in `month`
  return new Date(year, month, 0).getDate();
}

// monthBackgrounds.js
export const MONTH_BACKGROUNDS = {
  1: "radial-gradient(circle at top left, #b3cde0, #011f4b)", // January – icy blues
  2: "radial-gradient(circle at bottom right, #cce0ff, #336699)", // February – frosty blue
  3: "radial-gradient(circle, #a8e6cf, #56ab2f)", // March – spring green
  4: "radial-gradient(circle, #fef9d7, #d9a7c7)", // April – pastel bloom
  5: "radial-gradient(circle, #d4fc79, #96e6a1)", // May – fresh green
  6: "radial-gradient(circle, #fceabb, #f8b500)", // June – sunny yellow
  7: "radial-gradient(circle, #89f7fe, #66a6ff)", // July – bright summer sky
  8: "radial-gradient(circle, #ffecd2, #fcb69f)", // August – warm peach
  9: "radial-gradient(circle, #f6d365, #fda085)", // September – harvest orange
  10: "radial-gradient(circle, #ff9a9e, #fad0c4)", // October – autumn reds
  11: "radial-gradient(circle, #cfd9df, #e2ebf0)", // November – misty gray
  12: "radial-gradient(circle, #2c3e50, #4ca1af)", // December – winter night
};
