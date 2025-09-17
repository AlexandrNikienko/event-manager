import React, { useState } from "react";

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
        <div className="tooltip">
          {events.map((event) =>
              <div key={event.id} className="event-row">
                <span>{event.name}</span>

                <span>{event.note}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit && onEdit(event.id)
                  }}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete(event.id)
                  }}
                  aria-label={`Delete ${event.name}`}
                >
                  Delete
                </button>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}
