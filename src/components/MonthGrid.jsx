import React, { useContext, useMemo } from "react";
import { MONTH_NAMES, daysInMonth, WEEKDAYS } from "../utils/utils";
import DayTooltip from "./DayTooltip";
import { GlobalStateContext } from "../App";

function isDateInRange(checkYear, checkMonth, checkDay, startYear, startMonth, startDay, endYear, endMonth, endDay) {
  const checkDate = new Date(checkYear, checkMonth - 1, checkDay);
  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);
  return checkDate >= startDate && checkDate <= endDate;
}

function getMultiDayEventPositions(event, month, year) {
  if (!event.isMultiDay || !event.startDate || !event.endDate) return [];
  
  const positions = [];
  let startYear = event.startDate?.year;
  let startMonth = event.startDate?.month;
  let startDay = event.startDate?.day;
  let endYear = event.endDate?.year;
  let endMonth = event.endDate?.month;
  let endDay = event.endDate?.day;
  
  // For recurring multi-day events, adjust to the current viewing year
  if (event.isRecurring) {
    startYear = year;
    endYear = year;
  }
  
  const monthDays = daysInMonth(month, year);
  
  for (let d = 1; d <= monthDays; d++) {
    if (isDateInRange(year, month, d, startYear, startMonth, startDay, endYear, endMonth, endDay)) {
      const isStart = year === startYear && month === startMonth && d === startDay;
      const isEnd = year === endYear && month === endMonth && d === endDay;
      positions.push({
        day: d,
        isStart,
        isEnd,
        isMiddle: !isStart && !isEnd,
      });
    }
  }
  
  return positions;
}

export default function MonthGrid({ month, eventsMap = {}, onDelete, onEdit, onDayClick }) {
  const { year } = useContext(GlobalStateContext);
  const days = daysInMonth(month, year);

  // Get today's date
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDay = isCurrentMonth ? today.getDate() : null;

  // Calculate offset for first weekday
  const firstDay = new Date(year, month - 1, 1).getDay();
  const offset = (firstDay === 0 ? 6 : firstDay - 1);

  // Process events to include multi-day event information
  const enrichedEventsMap = useMemo(() => {
    const map = { ...eventsMap };
    
    // Get all events from all days to find multi-day events
    const allEvents = Object.values(map).flat();
    const multiDayEvents = allEvents.filter(e => e.isMultiDay);
    
    // Reset the map for reconstruction
    const newMap = {};
    
    // Add single-day events
    Object.entries(map).forEach(([day, dayEvents]) => {
      newMap[day] = dayEvents.filter(e => !e.isMultiDay);
    });
    
    // Add multi-day events to all affected days
    multiDayEvents.forEach(event => {
      const positions = getMultiDayEventPositions(event, month, year);
      positions.forEach(pos => {
        if (!newMap[pos.day]) newMap[pos.day] = [];
        newMap[pos.day].push({
          ...event,
          multiDayInfo: {
            isStart: pos.isStart,
            isEnd: pos.isEnd,
            isMiddle: pos.isMiddle,
          }
        });
      });
    });
    
    return newMap;
  }, [eventsMap, month, year]);

  const dayCells = [];

  for (let i = 0; i < offset; i++) {
    dayCells.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
  }

  for (let d = 1; d <= days; d++) {
    const events = enrichedEventsMap[d] || [];
    const isToday = isCurrentMonth && d === todayDay;
    const multiDayEvents = events.filter(e => e.multiDayInfo);
    const singleDayEvents = events.filter(e => !e.multiDayInfo);
    
    const multiDayClasses = multiDayEvents
      .map((e, idx) => {
        if (e.multiDayInfo.isStart) return `multi-day-start-${idx % 3}`;
        if (e.multiDayInfo.isEnd) return `multi-day-end-${idx % 3}`;
        return `multi-day-mid-${idx % 3}`;
      })
      .join(' ');
    
    dayCells.push(
      <div
        key={d}
        className={`day-cell${events.length ? " has-event" : ""}${isToday ? " today" : ""}${multiDayEvents.length ? " has-multi-day-event" : ""} ${multiDayClasses}`}
        onClick={() => onDayClick && onDayClick({ month, day: d, year })}
      >
        <div className="day-number">{d}</div>

        {events.length > 0 && (
          <div className="dots">
            {singleDayEvents.slice(0, 4).map((e, i) => (
              <div key={i} className="dot" title={e.name}></div>
            ))}
          </div>
        )}

        <DayTooltip events={events} onDelete={onDelete} onEdit={onEdit}/>
      </div>
    );
  }

  return (
    <div className="month-card">
      <div className="month-inner">
        <div className="month-title">{MONTH_NAMES[month - 1]} {year}</div>

        <div className="weekdays-row">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="weekday-cell">{wd}</div>
          ))}
        </div>
        
        <div className="days-grid">{dayCells}</div>
      </div>
    </div>
  );
}
