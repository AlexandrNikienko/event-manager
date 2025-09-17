import React from "react";
import { MONTH_NAMES, daysInMonth } from "../utils";
import DayTooltip from "./DayTooltip";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function MonthGrid({ month, year, eventsMap = {}, onDelete, onEdit, onDayClick }) {
  const days = daysInMonth(month, year);

  // Get today's date
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDay = isCurrentMonth ? today.getDate() : null;

  // Calculate offset for first weekday
  const firstDay = new Date(year, month - 1, 1).getDay();
  const offset = (firstDay === 0 ? 6 : firstDay - 1);

  const dayCells = [];
  
  for (let i = 0; i < offset; i++) {
    dayCells.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
  }

  for (let d = 1; d <= days; d++) {
    const events = eventsMap[d] || [];
    const isToday = isCurrentMonth && d === todayDay;
    dayCells.push(
      <div
        key={d}
        className={`day-cell${events.length ? " has-event" : ""}${isToday ? " today" : ""}`}
        onClick={() => onDayClick && onDayClick({ month, day: d, year })}
      >
        <div className="day-number">{d}</div>

        {events.length ? (
          <div className="dot" title={events.map((e) => e.name).join(", ")}>
            {events.length > 1 ? <span className="count">{events.length}</span> : null}
          </div>
        ) : null}

        <DayTooltip events={events} onDelete={onDelete} onEdit={onEdit} />
      </div>
    );
  }

  return (
    <div className="month-card">
      <div className="month-title">{MONTH_NAMES[month - 1]} {year}</div>
      <div className="weekdays-row">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="weekday-cell">{wd}</div>
        ))}
      </div>
      <div className="days-grid">{dayCells}</div>
    </div>
  );
}
