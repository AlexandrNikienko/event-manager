import React, { useState } from "react";
import { getEventType } from "../utils/eventIcons";
import { Delete, Edit } from "../utils/icons";

/*
  Simple hover tooltip. Contains a Delete button (calls onDelete(id)).
  You can replace with a popover library later for better mobile support.
*/
export default function DayTooltip({ events = [], onDelete, onEdit }) {
  const [show, setShow] = useState(false);

  if (!events || events.length === 0) return null;

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {show && (
        <div className="tooltip"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          {events.map((event) =>
            <div key={event.id} className="tooltip-item">
              <span className="sidebar-icon">
                {getEventType(event.type).icon}
              </span>

              <span>{event.name}</span>

              <button
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(event.id)
                }}
              >
                <Edit></Edit>
              </button>

              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(event.id)
                }}
                aria-label={`Delete ${event.name}`}
              >
                <Delete></Delete>
              </button>
            </div>
          )
          }
        </div>
      )}
    </div>
  );
}
