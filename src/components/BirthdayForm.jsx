import React, { useState } from "react";

/*
  Uses <input type="date"> for convenience. We extract month/day and pass up.
*/
export default function BirthdayForm({ onAdd }) {
  const [name, setName] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !dateStr) {
      return alert("Please provide a name and a date.");
    }
    // parse date input (yyyy-mm-dd) as local date
    const d = new Date(dateStr + "T00:00:00");
    const month = d.getMonth() + 1;
    const day = d.getDate();

    onAdd({ name: name.trim(), month, day, note: note.trim(), isRecurring });
    setName("");
    setDateStr("");
    setNote("");
    setIsRecurring(false);
  }

  return (
    <form className="birthday-form" onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        aria-label="Name"
      />
      <input
        type="date"
        value={dateStr}
        onChange={(e) => setDateStr(e.target.value)}
        aria-label="Birth date"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        aria-label="Note"
      />
      <label>
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
        />
        Repeat every year
      </label>
      <button type="submit">Add Event</button>
    </form>
  );
}
