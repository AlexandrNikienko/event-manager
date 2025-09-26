import React from "react";
import { Tooltip, Button, Flex } from "antd";
import { getEventType } from "../utils/eventIcons";
import { Delete, Edit } from "../utils/icons";

export default function DayTooltip({ events = [], onDelete, onEdit }) {
  if (!events || events.length === 0) return null;

  return (
    <Tooltip
      color="#fff"
      placement="top"
      trigger="hover"
      title={
        <Flex className="tooltip" vertical="true" gap="0">
          {events.map((event) => (
            <Flex className="tooltip-item" align="center" gap="small" justify="start"
              key={event.id || `${event.name}-${event.month}-${event.day}`}
            >
              <span>{getEventType(event.type).icon}</span>

              <span className="tooltip-event-name">{event.name}</span>

              <Button
                className="edit-btn"
                size="small"
                type="text"
                icon={<Edit />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(event.id);
                }}
              />

              <Button
                className="delete-btn"
                size="small"
                type="text"
                danger
                icon={<Delete />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(event.id);
                }}
              />
            </Flex>
          ))}
        </Flex>
      }
    >
      <div className="tooltip-wrapper" />
    </Tooltip>
  );
}
