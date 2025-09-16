import React, { useState, useEffect } from "react";
import { daysInMonth } from "../utils";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function EventForm({ onSubmit, initial }) {
  const defaultState = {
    name: "",
    note: "",
    month: 1,
    day: 1,
    isRecurring: true,
    year: "unknown"
  };

  const [name, setName] = useState(initial?.name || defaultState.name);
  const [note, setNote] = useState(initial?.note || defaultState.note);
  const [month, setMonth] = useState(initial?.month || defaultState.month);
  const [isRecurring, setIsRecurring] = useState(initial?.isRecurring ?? defaultState.isRecurring);
  const [year, setYear] = useState(initial?.year !== undefined ? initial.year : defaultState.year);
  const [day, setDay] = useState(initial?.day || defaultState.day);

  // Years for select
  const currentYear = new Date().getFullYear();
  const years = ["unknown", ...Array.from({ length: 151 }, (_, i) => currentYear - 100 + i)];

  // Calculate days count
  let daysCount;
  if (year === "unknown" && month === 2) {
    daysCount = 29;
  } else if (year === "unknown") {
    daysCount = daysInMonth(month, 2024); // Use leap year for max days
  } else {
    daysCount = daysInMonth(month, Number(year));
  }

  useEffect(() => {
    if (day > daysCount) setDay(daysCount);
  }, [month, year, daysCount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      note,
      month: Number(month),
      day: Number(day),
      isRecurring,
      year: year === "unknown" ? undefined : Number(year),
    });
    // Reset form fields
    setName(defaultState.name);
    setNote(defaultState.note);
    setMonth(defaultState.month);
    setDay(defaultState.day);
    setIsRecurring(defaultState.isRecurring);
    setYear(defaultState.year);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Event Name"
        required
      />
      <input
        type="text"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Note"
      />
      <label>
        Month:
        <select value={month} onChange={e => setMonth(Number(e.target.value))}>
          {MONTH_NAMES.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
      </label>
      <label>
        Day:
        <select value={day} onChange={e => setDay(Number(e.target.value))}>
          {[...Array(daysCount)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </label>

      <label>
        Year:
        <select value={year} onChange={e => setYear(e.target.value)}>
          {years.map(y =>
            <option key={y} value={y}>{y === "unknown" ? "Unknown" : y}</option>
          )}
        </select>
      </label>
      
      <label>
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={e => setIsRecurring(e.target.checked)}
        />
        Repeat every year
      </label>


      <button type="submit">Save</button>
    </form>
  );
}
