import React, { useContext } from "react";
import { Button, Flex } from 'antd';
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { daysInMonth } from "../utils/utils";
import MonthGrid from "./MonthGrid";
import { GlobalStateContext } from "../App";

export default function YearViewCalendar({ events = [], onDelete, onEdit, onDayClick, loading }) {
  const { year, setYear } = useContext(GlobalStateContext);

  // console.log('loading:', loading);

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
        <div className="year-view">
          {Array.from({ length: 12 }).map((_, i) => {
            const monthIndex = i + 1;
            return (
              <MonthGrid
                key={monthIndex}
                month={monthIndex}
                eventsMap={map[monthIndex]}
                onDelete={onDelete}
                onEdit={onEdit}
                onDayClick={onDayClick}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
