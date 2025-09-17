import React, { useState } from "react";
import MonthGrid from "./MonthGrid";
import { daysInMonth } from "../utils";

export default function YearViewCalendar({ events = [], onDelete, onEdit, onDayClick }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  // build map month -> day -> [events] (recalculate on every render)
  const map = {};
  for (let m = 1; m <= 12; m++) map[m] = {};

  events.forEach((e) => {
    const dim = daysInMonth(e.month, year);
    const day = Math.min(e.day, dim);

    // Only show non-recurring events on their specific year
    if (!e.isRecurring && e.year !== year) return;

    if (!map[e.month]) map[e.month] = {};
    const arr = map[e.month][day] || [];
    arr.push(e);
    map[e.month][day] = arr;
  });

  return (
    <div>
      <div className="controls">
        <button onClick={() => setYear(year - 1)}>&lt; Prev</button>
        <span style={{ fontWeight: 600, fontSize: "1.2rem" }}>{year}</span>
        <button onClick={() => setYear(year + 1)}>Next &gt;</button>
      </div>
      <div className="year-view">
        {Array.from({ length: 12 }).map((_, i) => {
          const monthIndex = i + 1;
          return (
            <MonthGrid
              key={monthIndex}
              month={monthIndex}
              year={year}
              eventsMap={map[monthIndex]}
              onDelete={onDelete}
              onEdit={onEdit}
              onDayClick={onDayClick}
            />
          );
        })}
      </div>
    </div>
  );
}
