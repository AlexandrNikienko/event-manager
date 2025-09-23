import React, { useState, useEffect } from "react";
import EventForm from "./components/EventForm";
import YearViewCalendar from "./components/YearViewCalendar";
import { eventService } from './services/eventService';
import { migrateEventsToFirebase } from './utils/migrateToFirebase';
import { getEventType } from "./utils/eventIcons";
import { DoubleArrows, Edit, Delete, Calendar } from "./utils/icons";
import { LoginButton } from "./components/LoginButton";
import { useAuth } from "./AuthProvider.jsx";

// import { getFirestore, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
// const db = getFirestore();


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

  const { user, loading: loadingUser, logout } = useAuth();

  useEffect(() => {
    if (loadingUser) return; // still checking auth
    if (!user) return;       // no logged-in user → don’t load
    loadEvents();
  }, [user, loadingUser, year]);

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

  //useEffect(() => {
    //patchEventsUserId
    //patchEventsUserIdAndDeleteEmptyYear();
  //}, []);

  // async function patchEventsUserId() {
  //   const snapshot = await getDocs(collection(db, "events"));
  //   for (const doc of snapshot.docs) {
  //     const data = doc.data();
  //     if (!data.userId) {
  //       await updateDoc(doc.ref, {
  //         userId: "kLkSNogK6JMNbN15GmdgGkr4Qvw1",
  //       });
  //       console.log(`Updated ${doc.id}`);
  //     }
  //   }
  // }

  // async function patchEventsUserIdAndDeleteEmptyYear() {
  //   const snapshot = await getDocs(collection(db, "events"));

  //   for (const d of snapshot.docs) {
  //     const data = d.data();

  //     if (!data.year || data.year === "") {
  //       await deleteDoc(d.ref);
  //       console.log(`Deleted ${d.id}`);
  //     } else if (!data.userId) {
  //       await updateDoc(d.ref, {
  //         userId: "kLkSNogK6JMNbN15GmdgGkr4Qvw1",
  //       });
  //       console.log(`Updated ${d.id}`);
  //     }
  //   }
  // }

  const loadEvents = async () => {
    if (!user) return; // extra safety

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

  if (loadingUser) return <div>Loading...</div>;

  if (!user) {
    return (
      <div>
        <h2>Please sign in</h2>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1><Calendar/> Event Calendar</h1>

        <button
          className="create-event-btn"
          onClick={handleCreateEvent}
        >
          + Add Event
        </button>

        <button className="logout-button" onClick={logout}>Logout</button>
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
            <DoubleArrows/>
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
            {filteredEvents.length === 0 && <li key="no-events" className="muted">No events</li>}

            {filteredEvents.map(event => {
              return (
                <li
                  key={event.id || `${event.name}-${event.month}-${event.day}`}
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
