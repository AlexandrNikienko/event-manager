import React, { useState } from "react";
import MonthGrid from "./MonthGrid";
import { MONTH_NAMES } from "../utils";

export default function YearView({ eventsMap, onDelete }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  return (
    <div>
      <div className="controls" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => setYear(year - 1)}>&lt; Prev</button>
        <span style={{ fontWeight: 600, fontSize: "1.2rem" }}>{year}</span>
        <button onClick={() => setYear(year + 1)}>Next &gt;</button>
      </div>
      <div className="year-view">
        {MONTH_NAMES.map((_, idx) => (
          <MonthGrid
            key={idx}
            month={idx + 1}
            year={year}
            eventsMap={eventsMap[idx + 1] || {}}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}