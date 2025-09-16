import React, { useState } from "react";
import MonthGrid from "./MonthGrid";
import { daysInMonth } from "../utils";

export default function YearViewCalendar({ birthdays = [], onDelete, onEdit }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  // build map month -> day -> [events] (recalculate on every render)
  const map = {};
  for (let m = 1; m <= 12; m++) map[m] = {};

  birthdays.forEach((b) => {
    const dim = daysInMonth(b.month, year);
    const day = Math.min(b.day, dim); // handles Feb 29 on non-leap years
    if (!map[b.month]) map[b.month] = {};
    const arr = map[b.month][day] || [];
    arr.push(b);
    map[b.month][day] = arr;
  });

  return (
    <div>
      <div className="controls" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
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
            />
          );
        })}
      </div>
    </div>
  );
}
