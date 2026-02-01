import React, { useContext, useState } from "react";
import { Button, Flex } from 'antd';
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { daysInMonth } from "../utils/utils";
import MonthGrid from "./MonthGrid";
import { GlobalStateContext } from "../App";

export default function YearViewCalendar({ events = [], onDelete, onEdit, onDayClick, loading, hoveredDate }) {
  const { year, setYear } = useContext(GlobalStateContext);
  const [expandedMonth, setExpandedMonth] = useState(null);

  // console.log('loading:', loading);

  // build map month -> day -> [events] (recalculate on every render)
  const map = {};
  for (let m = 1; m <= 12; m++) map[m] = {};

  events.forEach((e) => {
    if (e.isMultiDay) {
      // For multi-day events, add them to all months they span
      const startMonth = e.startDate?.month;
      const endMonth = e.endDate?.month;
      let startYear = e.startDate?.year;
      let endYear = e.endDate?.year;
      
      // For recurring multi-day events, adjust years to current viewing year
      if (e.isRecurring) {
        startYear = year;
        endYear = year;
      }
      
      // Add event to all months it spans in the current year
      if (startYear === year && endYear === year) {
        // Event is within the same year
        for (let m = startMonth; m <= endMonth; m++) {
          if (!map[m]) map[m] = {};
          const arr = map[m][1] || []; // Add to day 1 as a placeholder
          if (!arr.find(ev => ev.id === e.id)) { // Avoid duplicates
            arr.push(e);
          }
          map[m][1] = arr;
        }
      } else if (startYear === year) {
        // Event starts in current year, ends in next year
        for (let m = startMonth; m <= 12; m++) {
          if (!map[m]) map[m] = {};
          const arr = map[m][1] || [];
          if (!arr.find(ev => ev.id === e.id)) {
            arr.push(e);
          }
          map[m][1] = arr;
        }
      } else if (endYear === year) {
        // Event starts in previous year, ends in current year
        for (let m = 1; m <= endMonth; m++) {
          if (!map[m]) map[m] = {};
          const arr = map[m][1] || [];
          if (!arr.find(ev => ev.id === e.id)) {
            arr.push(e);
          }
          map[m][1] = arr;
        }
      }
    } else {
      // Single day events
      const dim = daysInMonth(e.startDate?.month, year);
      const day = Math.min(e.startDate?.day, dim);

      // Only show non-recurring events on their specific year
      //if (!e.isRecurring && e.startDate.year !== year) return; //??? 

      if (!map[e.startDate?.month]) map[e.startDate?.month] = {};
      const arr = map[e.startDate?.month][day] || [];
      arr.push(e);
      map[e.startDate?.month][day] = arr;
    }
  });

  return (
    <>
      <Flex gap="middle" justify="center" align="center" className="controls">
        <Button color="default" variant="outlined" onClick={() => setYear(year - 1)}>
          <LeftOutlined />
        </Button>

        <b>{year}</b>

        <Button color="default" variant="outlined" onClick={() => setYear(year + 1)}>
          <RightOutlined />
        </Button>
      </Flex>

      {true && (
        <div className={`year-view${expandedMonth ? " expanded-month-view" : ""}`}>
          {expandedMonth ? (
            // Expanded single month view
            <MonthGrid
              key={expandedMonth}
              month={expandedMonth}
              eventsMap={map[expandedMonth]}
              onDelete={onDelete}
              onEdit={onEdit}
              onDayClick={onDayClick}
              hoveredDate={hoveredDate}
              isExpanded={true}
              onCollapseMonth={() => setExpandedMonth(null)}
            />
          ) : (
            // Calendar grid view
            Array.from({ length: 12 }).map((_, i) => {
              const monthIndex = i + 1;
              return (
                <MonthGrid
                  key={monthIndex}
                  month={monthIndex}
                  eventsMap={map[monthIndex]}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onDayClick={onDayClick}
                  hoveredDate={hoveredDate}
                  isExpanded={false}
                  onExpandMonth={() => setExpandedMonth(monthIndex)}
                />
              );
            })
          )}
        </div>
      )}
    </>
  );
}
