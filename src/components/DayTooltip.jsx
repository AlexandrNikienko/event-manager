import React from "react";
import { Tooltip } from "antd";
import EventList from "./EventList";

export default function DayTooltip({ events = [], onDelete, onEdit, year }) {
  if (!events || events.length === 0) return null;

  return (
    <Tooltip
      color="#fff"
      placement="top"
      trigger="hover"
      title={
        <EventList events={events} year={year} hidePast={false} onDelete={onDelete} onEdit={onEdit} />
      }
    >
      <div className="tooltip-wrapper" />
    </Tooltip>
  );
}
