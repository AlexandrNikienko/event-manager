import React, { useState } from "react";

/*
  Simple hover tooltip. Contains a Delete button (calls onDelete(id)).
  You can replace with a popover library later for better mobile support.
*/
export default function DayTooltip({ events = [], onDelete, onEdit }) {
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editNote, setEditNote] = useState("");

  const startEdit = (event) => {
    setEditingId(event.id);
    setEditName(event.name);
    setEditNote(event.note || "");
  };

  const saveEdit = () => {
    if (onEdit && editingId) {
      onEdit(editingId, { name: editName, note: editNote });
    }
    setEditingId(null);
    setEditName("");
    setEditNote("");
  };

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
            editingId === event.id ? (
              <div key={event.id} className="edit-form">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Note"
                />
                <button onClick={saveEdit}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <div key={event.id} className="event-row">
                <span>{event.name}</span>
                <span>{event.note}</span>
                <button onClick={() => startEdit(event)}>Edit</button>
                <button
                  className="delete-btn"
                  onClick={() => onDelete && onDelete(event.id)}
                  aria-label={`Delete ${event.name}`}
                >
                  Delete
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
