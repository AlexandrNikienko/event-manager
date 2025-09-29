import React, { useState } from "react";
import { Tooltip } from "antd";
import EventList from "./EventList";

export default function DayTooltip({ events = [], onDelete, onEdit, year }) {
  const [open, setOpen] = useState(false);

  if (!events || events.length === 0) return null;

  return (
    <Tooltip
      color="#fff"
      placement="top"
      trigger="hover"
      open={open}
      onOpenChange={setOpen}
      title={
        <EventList events={events} year={year} onDelete={onDelete} hideDate={true} 
          onEdit={(id) => {
            setOpen(false);
            onEdit?.(id);
          }} />
      }
    >
      <div className="tooltip-wrapper" />
    </Tooltip>
  );
}
