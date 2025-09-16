const STORAGE_KEY = "events";

export function loadEvents() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  // Default sample dates if storage is empty
  return [
    { id: 1, name: "Alice", month: 1, day: 15, note: "Friend" },
    { id: 2, name: "Bob", month: 2, day: 29, note: "Colleague" },
    { id: 3, name: "Carol", month: 7, day: 4, note: "Family" }
  ];
}

export function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}