import React, { useState, useEffect } from "react";
import EventForm from "./components/EventForm";
import YearViewCalendar from "./components/YearViewCalendar";
import { loadEvents, saveEvents } from "./utils/storage";

export default function App() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const handleEventSubmit = (eventData) => {
    if (editingEvent) {
      const updated = events.map((e) =>
        e.id === editingEvent.id ? { ...e, ...eventData } : e
      );
      setEvents(updated);
      saveEvents(updated);
      setEditingEvent(null);
    } else {
      const newEvents = [...events, { ...eventData, id: Date.now() }];
      setEvents(newEvents);
      saveEvents(newEvents);
    }
    setShowModal(false);
  };

  const handleEdit = (id) => {
    const event = events.find((e) => e.id === id);
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleDayClick = (date) => {
    setNewEvent({
      name: "",
      note: "",
      month: date.month,
      day: date.day,
      year: date.year,
      isRecurring: true
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const filtered = events.filter((e) => e.id !== id);
    setEvents(filtered);
    saveEvents(filtered);
  }

  const handleCreateEvent = () => {
    setNewEvent(null);
    setShowModal(true);
    setEditingEvent(null);
  };

  // Sidebar logic
  const eventsOfYear = events.filter(e => e.isRecurring || e.year === year);

  eventsOfYear.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });

  // Handler to update year from YearViewCalendar
  const handleYearChange = (newYear) => {
    setYear(newYear);
  };

  return (
    <div className="app">
        <header className="app-header">
          <h1>Event Calendar</h1>
          <button
            className="create-event-btn"
            onClick={handleCreateEvent}
          >
            Create Event
          </button>
        </header>

        {showModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <header>
                {editingEvent ? "Edit Event" : "Create Event"}
              </header>
              <EventForm
                onSubmit={handleEventSubmit}
                initial={editingEvent || newEvent}
                onCancel={() => {
                  setShowModal(false);
                  setEditingEvent(null);
                }}
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex" }}>
          <aside className="sidebar">
            <h2>Events in {year}</h2>

            <ul className="sidebar-list">
              {eventsOfYear.length === 0 && <li className="muted">No events</li>}

              {eventsOfYear.map(event => (
                <li key={event.id} className="sidebar-event">
                  <span className="sidebar-date">{event.month}/{event.day}</span>
                  <span className="sidebar-name">{event.name}</span>
                  {event.note && <span className="sidebar-note">({event.note})</span>}
                  <button className="sidebar-edit" onClick={() => handleEdit(event.id)}>Edit</button>
                  <button className="sidebar-delete" onClick={() => handleDelete(event.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </aside>

          <YearViewCalendar
            events={events}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onDayClick={handleDayClick}
            year={year}
            onYearChange={handleYearChange}
          />
        </div>
    </div>
  );
}
