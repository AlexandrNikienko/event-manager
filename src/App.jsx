import React, { useState, useEffect } from "react";
import EventForm from "./components/EventForm";
import YearViewCalendar from "./components/YearViewCalendar";
import { loadEvents, saveEvents } from "./utils/storage";

export default function App() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(null);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const handleEventSubmit = (eventData) => {
    console.log("Event submitted:", eventData);
    if (editingEvent) {
      console.log("Editing event:", editingEvent);
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
      console.log("New events list:", newEvents);
      setEvents(newEvents);
      saveEvents(newEvents);
    }
    setShowModal(false); // Close modal after save
  };

  const handleEdit = (id) => {
    console.log("Edit clicked:", id);
    const event = events.find((e) => e.id === id);
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleDayClick = (date) => {
    console.log("Day clicked:", date);
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
    console.log("handleDelete:", id);
    const filtered = events.filter((e) => e.id !== id);
    setEvents(filtered);
    saveEvents(filtered);
  }

  const handleCreateEvent = () => {
    setNewEvent({
      name: "",
      note: "",
      month: "",
      day: "",
      year: "",
      isRecurring: true
    });
    setShowModal(true);
    setEditingEvent(null);
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
      <YearViewCalendar
        events={events}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onDayClick={handleDayClick}
      />
    </div>
  );
}
