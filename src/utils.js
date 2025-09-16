export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function daysInMonth(month, year) {
  // month: 1..12
  // new Date(year, month, 0).getDate() returns number of days in `month`
  return new Date(year, month, 0).getDate();
}
