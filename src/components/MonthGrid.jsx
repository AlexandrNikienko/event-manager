import React from "react";
import { MONTH_NAMES, daysInMonth } from "../utils";
import DayTooltip from "./DayTooltip";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function MonthGrid({ month, year, eventsMap = {}, onDelete, onEdit }) {
  const days = daysInMonth(month, year);

  // Calculate the weekday of the first day (0=Sunday, 1=Monday, ...)
  const firstDay = new Date(year, month - 1, 1).getDay();
  // Adjust so that Monday is first (0=Monday, 6=Sunday)
  const offset = (firstDay === 0 ? 6 : firstDay - 1);

  const dayCells = [];
  // Add empty cells for offset
  for (let i = 0; i < offset; i++) {
    dayCells.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
  }
  for (let d = 1; d <= days; d++) {
    const events = eventsMap[d] || [];
    dayCells.push(
      <div key={d} className={`day-cell ${events.length ? "has-event" : ""}`}>
        <div className="day-number">{d}</div>
        {events.length ? (
          <div className="dot" title={events.map((e) => e.name).join(", ")}>
            {events.length > 1 ? <span className="count">{events.length}</span> : null}
          </div>
        ) : null}
        <DayTooltip
          events={events}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </div>
    );
  }

  return (
    <div className="month-card">
      <div className="month-title">{MONTH_NAMES[month - 1]}</div>
      <div className="weekdays-row">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="weekday-cell">{wd}</div>
        ))}
      </div>
      <div className="days-grid">{dayCells}</div>
    </div>
  );
}
