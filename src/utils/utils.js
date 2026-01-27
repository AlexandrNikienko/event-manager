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

  let birthYear;
  if (event.isMultiDay) {
    birthYear = Number(event.startDate.year);
  } else {
    birthYear = Number(event.year);
  }
  
  const age = currentYear - birthYear;

  return age;
};

export function isEventInPast(event, year) {
  // console.log('isEventInPast called with event:', event, 'year:', year);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  if (event.isMultiDay) {
    // For multi-day events, check if the end date is in the past
    // For recurring events, use the viewing year; otherwise use the event's year
    const eventYear = event.isRecurring ? year : event.endDate.year;
    const eventDate = new Date(eventYear, event.endDate.month - 1, event.endDate.day);
    return eventDate < todayDate;
  } else {
    // Single day events
    // For recurring events, use the viewing year; otherwise use the event's year
    const eventYear = event.isRecurring ? year : event.startDate?.year;
    const eventDate = new Date(eventYear, event.startDate?.month - 1, event.startDate?.day);
    return eventDate < todayDate;
  }
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
