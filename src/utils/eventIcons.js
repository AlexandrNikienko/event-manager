export const EVENT_TYPES = [
    { value: "birthday", label: "Birthday", icon: "🎂" },
    { value: "anniversary", label: "Anniversary", icon: "💍" },
    { value: "holiday", label: "Holiday", icon: "🎉" },
    { value: "party", label: "Party", icon: "🥳" },
    { value: "doctor", label: "Doctor Appointment", icon: "🩺" },
    { value: "reminder", label: "Reminder", icon: "🔔" },
    { value: "other", label: "Other", icon: "📌" },
];

// helper to lookup by value
export const getEventType = (type) =>
    EVENT_TYPES.find((ev) => ev.value === type)
    || EVENT_TYPES.find((ev) => ev.value === "birthday");