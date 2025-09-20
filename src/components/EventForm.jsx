import React, { useState, useEffect } from "react";
import { daysInMonth } from "../utils";
import { EVENT_TYPES } from "../utils/eventIcons";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function EventForm({ onSubmit, initial, onCancel }) {
  const defaultState = {
    name: "",
    note: "",
    month: 1,
    day: 1,
    isRecurring: true,
    year: "unknown",
    type: "birthday",
  };

  const [name, setName] = useState(initial?.name || defaultState.name);
  const [note, setNote] = useState(initial?.note || defaultState.note);
  const [month, setMonth] = useState(initial?.month || defaultState.month);
  const [isRecurring, setIsRecurring] = useState(initial?.isRecurring ?? defaultState.isRecurring);
  const [year, setYear] = useState(initial?.year !== undefined ? initial.year : defaultState.year);
  const [day, setDay] = useState(initial?.day || defaultState.day);
  const [type, setType] = useState(initial?.type || defaultState.type);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      name,
      note,
      month: Number(month),
      day: Number(day),
      isRecurring,
      year: year === "unknown" ? "unknown" : Number(year),
      type
    });
    // Reset form fields
    setName(defaultState.name);
    setNote(defaultState.note);
    setMonth(defaultState.month);
    setDay(defaultState.day);
    setIsRecurring(defaultState.isRecurring);
    setYear(defaultState.year);
    setType(defaultState.type);
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Event Name"
          required
        />
      </div>

      <div>
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Note"
        />
      </div>

      <div>
        <label>
          Type:
          <select value={type} onChange={e => setType(e.target.value)}>
            {EVENT_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.icon + ' ' + t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
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
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={e => setIsRecurring(e.target.checked)}
          />
          Repeat every year
        </label>
      </div>


      <footer>
        <button onClick={onCancel} type="button">Cancel</button>

        <button type="submit">Save</button>
      </footer>
    </form>
  );
}
