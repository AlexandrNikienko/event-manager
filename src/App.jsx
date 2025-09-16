import React, { useState, useEffect } from "react";
import EventForm from "./components/EventForm";
import YearViewCalendar from "./components/YearViewCalendar";
import { loadEvents, saveEvents } from "./utils/storage";

export default function App() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const handleEventSubmit = (eventData) => {
    const newEvents = [...events, { ...eventData, id: Date.now() }];
    setEvents(newEvents);
    saveEvents(newEvents);
    setShowModal(false); // Close modal after save
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Event Calendar</h1>
      </header>
      
      <button onClick={() => setShowModal(true)}>Create Event</button>
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <EventForm onSubmit={handleEventSubmit} />
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
      <YearViewCalendar
        events={events}
        onDelete={id => {
          const filtered = events.filter(e => e.id !== id);
          setEvents(filtered);
          saveEvents(filtered);
        }}
        onEdit={(id, changes) => {
          const updated = events.map(e => e.id === id ? { ...e, ...changes } : e);
          setEvents(updated);
          saveEvents(updated);
        }}
      />
    </div>
  );
}
