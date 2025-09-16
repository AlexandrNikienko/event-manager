import React, { useState, useEffect } from "react";
import YearViewCalendar from "./components/YearViewCalendar";
import EventForm from "./components/EventForm";
import { loadEvents, saveEvents } from "./utils/storage";

export default function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const addEvent = (payload) => {
    const newItem = { id: String(Date.now()), ...payload };
    updateEvents([...events, newItem]);
  };

  const deleteEvents = (id) => {
    updateEvents(events.filter((b) => b.id !== id));
  };

  // Call this when you add/delete events
  const updateEvents = (newList) => {
    setEvents(newList);
    saveEvents(newList);
  };

  const handleEdit = (id, changes) => {
    const updated = events.map(b =>
      b.id === id ? { ...b, ...changes } : b
    );
    updateEvents(updated);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Event Calendar</h1>
      </header>

      <main>
        <div className="controls">
          <EventForm onAdd={addEvent} />
        </div>

        <YearViewCalendar
          events={events}
          onDelete={id => updateEvents(events.filter(b => b.id !== id))}
          onEdit={handleEdit}
        />
      </main>

      <footer className="app-footer">
        
      </footer>
    </div>
  );
}
