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
    { value: "friends", label: "Friends", icon: "🤗" },
    { value: "anniversary", label: "Anniversary", icon: "💍" },
    { value: "celebration", label: "Celebration", icon: "🥂" },
    { value: "holiday", label: "Holiday", icon: "🎉" },
    { value: "party", label: "Party", icon: "🥳" },
    { value: "festival", label: "Festival", icon: "🎪" },
    { value: "concert", label: "Concert", icon: "🎵" },
    { value: "vacation", label: "Vacation", icon: "🏖️" },
    { value: "doctor", label: "Doctor Appointment", icon: "🩺" },
    { value: "dentist", label: "Dentist", icon: "🦷" },
    { value: "reminder", label: "Reminder", icon: "🔔" },
    { value: "other", label: "Other", icon: "📌" },
];

export const getEventTypeIcon = (type) =>
    EVENT_TYPES.find((ev) => ev.value === type).icon || "📌";


// import { 
//   Calendar, Cake, Heart, Church, Baby, Home, Users, UserPlus,
//   Sparkles, PartyPopper, Music, Music2, Moon, Utensils,
//   Building2, Clock, Presentation, Mic, Wrench, GraduationCap,
//   Stethoscope, Pill, MessageCircle, Dumbbell, Activity,
//   Plane, Palmtree, Building, Car,
//   Bell, ShoppingCart, CreditCard, Sparkle, Settings,
//   School, FileText, BookOpen,
//   Star, Target, Gift,
//   MoreHorizontal
// } from 'lucide-react';

// const eventTypes = [
//   // Personal & Family
//   { value: 'birthday', label: 'Birthday', icon: Cake, color: 'text-rose-500' },
//   { value: 'anniversary', label: 'Anniversary', icon: Heart, color: 'text-pink-500' },
//   { value: 'wedding', label: 'Wedding', icon: Church, color: 'text-rose-400' },
//   { value: 'engagement', label: 'Engagement', icon: Heart, color: 'text-pink-400' },
//   { value: 'baby_shower', label: 'Baby Shower', icon: Baby, color: 'text-blue-400' },
//   { value: 'family_gathering', label: 'Family Gathering', icon: Home, color: 'text-orange-500' },
//   { value: 'reunion', label: 'Reunion', icon: UserPlus, color: 'text-teal-500' },

//   // Social & Fun
//   { value: 'holiday', label: 'Holiday', icon: Sparkles, color: 'text-amber-500' },
//   { value: 'party', label: 'Party', icon: PartyPopper, color: 'text-purple-500' },
//   { value: 'festival', label: 'Festival', icon: Music, color: 'text-fuchsia-500' },
//   { value: 'concert', label: 'Concert', icon: Music2, color: 'text-purple-600' },
//   { value: 'club_event', label: 'Club Event', icon: Music2, color: 'text-violet-600' },
//   { value: 'night_out', label: 'Night Out', icon: Moon, color: 'text-indigo-500' },
//   { value: 'dinner', label: 'Dinner', icon: Utensils, color: 'text-orange-600' },

//   // Work & Business
//   { value: 'meeting', label: 'Meeting', icon: Users, color: 'text-blue-600' },
//   { value: 'conference', label: 'Conference', icon: Building2, color: 'text-slate-600' },
//   { value: 'deadline', label: 'Deadline', icon: Clock, color: 'text-red-600' },
//   { value: 'presentation', label: 'Presentation', icon: Presentation, color: 'text-blue-500' },
//   { value: 'interview', label: 'Interview', icon: Mic, color: 'text-cyan-600' },
//   { value: 'workshop', label: 'Workshop', icon: Wrench, color: 'text-amber-600' },
//   { value: 'training', label: 'Training', icon: GraduationCap, color: 'text-indigo-600' },

//   // Health & Self-care
//   { value: 'doctor', label: 'Doctor Appointment', icon: Stethoscope, color: 'text-blue-500' },
//   { value: 'dentist', label: 'Dentist', icon: Pill, color: 'text-cyan-500' },
//   { value: 'therapy', label: 'Therapy', icon: MessageCircle, color: 'text-teal-600' },
//   { value: 'gym', label: 'Gym / Workout', icon: Dumbbell, color: 'text-red-500' },
//   { value: 'checkup', label: 'Health Checkup', icon: Activity, color: 'text-green-600' },

//   // Travel & Life
//   { value: 'trip', label: 'Trip', icon: Plane, color: 'text-sky-500' },
//   { value: 'vacation', label: 'Vacation', icon: Palmtree, color: 'text-green-500' },
//   { value: 'flight', label: 'Flight', icon: Plane, color: 'text-blue-400' },
//   { value: 'hotel', label: 'Hotel Stay', icon: Building, color: 'text-purple-400' },
//   { value: 'road_trip', label: 'Road Trip', icon: Car, color: 'text-yellow-600' },

//   // Everyday
//   { value: 'reminder', label: 'Reminder', icon: Bell, color: 'text-gray-600' },
//   { value: 'shopping', label: 'Shopping', icon: ShoppingCart, color: 'text-pink-600' },
//   { value: 'bill_payment', label: 'Bill Payment', icon: CreditCard, color: 'text-emerald-600' },
//   { value: 'cleaning', label: 'Cleaning', icon: Sparkle, color: 'text-sky-400' },
//   { value: 'maintenance', label: 'Maintenance', icon: Settings, color: 'text-orange-500' },

//   // Education
//   { value: 'class', label: 'Class', icon: School, color: 'text-blue-700' },
//   { value: 'exam', label: 'Exam', icon: FileText, color: 'text-red-700' },
//   { value: 'study', label: 'Study Session', icon: BookOpen, color: 'text-indigo-500' },

//   // Special
//   { value: 'milestone', label: 'Milestone', icon: Star, color: 'text-yellow-500' },
//   { value: 'goal', label: 'Goal', icon: Target, color: 'text-green-600' },
//   { value: 'celebration', label: 'Celebration', icon: Gift, color: 'text-rose-600' },

//   // Misc
//   { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-slate-500' },
// ];
