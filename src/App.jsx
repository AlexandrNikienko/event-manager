import React, { useState, useEffect } from "react";
import EventForm from "./components/EventForm";
import YearViewCalendar from "./components/YearViewCalendar";
import { loadEvents, saveEvents } from "./utils/storage";

export default function App() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const handleEventSubmit = (eventData) => {
    if (editingEvent) {
      // Edit existing event
      const updated = events.map((e) =>
        e.id === editingEvent.id ? { ...e, ...eventData } : e
      );
      setEvents(updated);
      saveEvents(updated);
      setEditingEvent(null);
    } else {
      // Create new event
      const newEvents = [...events, { ...eventData, id: Date.now() }];
      setEvents(newEvents);
      saveEvents(newEvents);
    }
    setShowModal(false); // Close modal after save
  };

  const handleEdit = (id) => {
    const event = events.find((e) => e.id === id);
    setEditingEvent(event);
    setShowModal(true);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Event Calendar</h1>
      </header>

      <button
        onClick={() => {
          setShowModal(true);
          setEditingEvent(null);
        }}
      >
        Create Event
      </button>
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <EventForm onSubmit={handleEventSubmit} initial={editingEvent} />
            <button
              onClick={() => {
                setShowModal(false);
                setEditingEvent(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <YearViewCalendar
        events={events}
        onDelete={(id) => {
          const filtered = events.filter((e) => e.id !== id);
          setEvents(filtered);
          saveEvents(filtered);
        }}
        onEdit={handleEdit}
      />
    </div>
  );
}
