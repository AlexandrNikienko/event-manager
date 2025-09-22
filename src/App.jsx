import React, { useState, useEffect } from "react";
import EventForm from "./components/EventForm";
import YearViewCalendar from "./components/YearViewCalendar";
import { eventService } from './services/eventService';
import { migrateEventsToFirebase } from './utils/migrateToFirebase';
import { getEventType } from "./utils/eventIcons";
import { DoubleArrows, Edit, Delete, Calendar } from "./utils/icons";

export default function App() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadEvents();
  }, [year]);

  // useEffect(() => {
  //   // Run migration once
  //   const migrate = async () => {
  //     await migrateEventsToFirebase();
  //     // After migration, load events from Firebase
  //     loadEvents();
  //   };

  //   //migrate();
  //   // Remove this useEffect after migration
  // }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedEvents = await eventService.getEventsByYear(year);
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSubmit = async (eventData) => {
    try {
      if (editingEvent) {
        // Update existing event
        const updated = await eventService.updateEvent(editingEvent.id, eventData);
        setEvents(events.map(e => e.id === editingEvent.id ? updated : e));
      } else {
        // Add new event
        const newEvent = await eventService.addEvent(eventData);
        setEvents([...events, newEvent]);
      }
      setShowModal(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
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

  const handleDelete = async (id) => {
    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

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

  const isEventInPast = (event, year) => {
    const today = new Date();
    const eventYear = event.isRecurring ? year : event.year;
    const eventDate = new Date(eventYear, event.month - 1, event.day);

    return eventDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const filteredEvents = eventsOfYear.filter(event => {
    const term = searchTerm.toLowerCase();
    return (
      event.name.toLowerCase().includes(term) ||
      (event.note && event.note.toLowerCase().includes(term))
    );
  });

  // if (loading) {
  //   return <div>Loading events...</div>;
  // }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1><Calendar></Calendar> Event Calendar</h1>

        <button
          className="create-event-btn"
          onClick={handleCreateEvent}
        >
          + Add Event
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
        <aside className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
          <div className="sidebar-extender" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <DoubleArrows></DoubleArrows>
          </div>
          
          <h2 className="sidebar-title">Events in {year}</h2>

          <div className="sidebar-search">
            <input className="search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
            />
          </div>

          <ul className="sidebar-list">
            {filteredEvents.length === 0 && <li className="muted">No events</li>}

            {filteredEvents.map(event => {
              return (
                <li
                  key={event.id}
                  className={`sidebar-event ${isEventInPast(event, year) ? "past-event" : ""}`}
                >
                  <span className="sidebar-date">{event.month}/{event.day}</span>

                  <span className="sidebar-icon">
                    {getEventType(event.type).icon}
                  </span>

                  <span className="sidebar-name">{event.name}</span>

                  {/* {event.note && <span className="sidebar-note">({event.note})</span>} */}

                  <button className="edit-btn" onClick={() => handleEdit(event.id)} title="Edit Event">
                    <Edit></Edit>
                  </button>

                  <button className="delete-btn" onClick={() => handleDelete(event.id)} title="Delete Event">
                    <Delete></Delete>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <YearViewCalendar
          events={events && filteredEvents}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onDayClick={handleDayClick}
          year={year}
          onYearChange={handleYearChange}
          loading={loading}
        />
      </div>
    </div>
  );
}
