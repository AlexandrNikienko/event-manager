import React, { useContext, useState } from "react";
import { Tooltip } from "antd";
import EventList from "./EventList";
import { GlobalStateContext } from "../App";

export default function DayTooltip({ events = [], onDelete, onEdit }) {
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
        <EventList events={events} onDelete={onDelete} hideDate={true} 
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
