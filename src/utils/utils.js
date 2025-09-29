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

export function getAge(event, currentYear) {
  if ((event.type !== "birthday" && event.type !== "anniversary") || !event.year || event.year === "unknown") {
    return null;
  }

  const birthYear = Number(event.year);
  const age = currentYear - birthYear;

  return age;
};

export function isEventInPast(event, year) {
  const today = new Date();
  const eventYear = event.isRecurring ? year : event.year;
  const eventDate = new Date(eventYear, event.month - 1, event.day);

  return eventDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export const EVENT_TYPES = [
    { value: "birthday", label: "Birthday", icon: "🎂" },
    { value: "anniversary", label: "Anniversary", icon: "💍" },
    { value: "holiday", label: "Holiday", icon: "🎉" },
    { value: "party", label: "Party", icon: "🥳" },
    { value: "doctor", label: "Doctor Appointment", icon: "🩺" },
    { value: "reminder", label: "Reminder", icon: "🔔" },
    { value: "other", label: "Other", icon: "📌" },
];

export const getEventTypeIcon = (type) =>
    EVENT_TYPES.find((ev) => ev.value === type).icon || "📌";
