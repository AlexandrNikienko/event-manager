import React, { useState, useEffect } from "react";
import { Button, Flex, Modal, Input, Checkbox, Dropdown, Avatar, Spin } from 'antd';
import { PlusOutlined, UserOutlined, QuestionOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "./AuthProvider.jsx";
import { eventService } from './services/eventService';
import { MONTH_NAMES } from "./utils/utils.js";
import { DoubleArrowsIcon } from "./utils/icons";
import EventForm from "./components/EventForm";
import YearViewCalendar from "./components/YearViewCalendar";
import { LoginButton } from "./components/LoginButton";
import EventList from "./components/EventList.jsx";
import rainbow from "./assets/rainbow.svg";

// import { getFirestore, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
// const db = getFirestore();

export default function App() {
  const [modal, contextHolder] = Modal.useModal();

  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hidePast, setHidePast] = useState(true);

  const { user, loading: loadingUser, logout } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  }

  useEffect(() => {
    if (loadingUser) return; // still checking auth
    if (!user) {
      setEvents([]); // clear events when user logs out
      return;
    }    // no logged-in user → don’t load
    loadEvents();
  }, [user, loadingUser, year]);

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
      setIsModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleEdit = (id) => {
    const event = events.find((e) => e.id === id);
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDayClick = (date) => {
    console.log('Day clicked:', date);
    setNewEvent({
      name: "",
      note: "",
      month: date.month,
      day: date.day,
      year: date.year,
      isRecurring: true,
      type: "birthday",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const event = events.find((e) => e.id === id);
    console.log('Deleting event:', event);

    modal.confirm({
      title: "Are you sure you want to delete this event?",
      content: event ? `${event.name} (${MONTH_NAMES[event.month - 1].slice(0, 3)} ${event.day})` : "This event",
      okText: "Yes, delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await eventService.deleteEvent(id);
          setEvents(events.filter((e) => e.id !== id));
        } catch (error) {
          console.error("Error deleting event:", error);
        }
      },
    });
  };

  const handleCreateEvent = () => {
    setNewEvent({
      name: '',
      note: '',
      month: 1,
      day: 1,
      isRecurring: true,
      year: "unknown",
      type: "birthday",
    });
    showModal(true);
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

  const filteredEvents = eventsOfYear.filter(event => {
    const term = searchTerm.toLowerCase();
    return (
      event.name.toLowerCase().includes(term) ||
      (event.note && event.note.toLowerCase().includes(term))
    );
  });

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      {contextHolder}

      <header className="app-header">
        <h1><img className="logo" src={rainbow} alt="Logo" />Life Palette</h1>

        <Button className="create-event-btn" onClick={handleCreateEvent} type="primary" disabled={!user}>
          <PlusOutlined /> Add Event
        </Button>

        {loading && <div>Loading events...</div>}

        <div className="user">
          {loadingUser ? (
            <Spin />
          ) : (
            <Dropdown
              arrow
              trigger={["hover"]}
              open={open}
              onOpenChange={setOpen}
              placement="bottomRight"
              popupRender={() => (
                <div className="custom-dropdown">
                  {user ? (
                    <>
                      <div style={{ marginBottom: 8 }}>
                        <b>Welcome, {user.displayName}</b>
                        <span>{user.email}</span>
                      </div>
                      
                      <Button
                        block
                        danger
                        type="primary"
                        icon={<LogoutOutlined />}
                        onClick={() => {
                          logout();
                          setOpen(false);
                        }}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <div>
                      Please, <LoginButton />
                      <br />
                      to activate the functionality
                    </div>
                  )}
                </div>
              )}
            >
              <Avatar
                size={"large"}
                className={`user-avatar ${!user ? "pulse" : ""}`}
                src={user?.photoURL || (user ? null : undefined)}
                icon={!user ? <QuestionOutlined /> : (!user?.photoURL && <UserOutlined />)}
                style={{ cursor: "pointer" }}
              />
            </Dropdown>
          )}
        </div>

      </header>

      <Flex gap="large" align="start">
        <aside className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
          <div className="sidebar-extender" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <DoubleArrowsIcon />
          </div>

          <div className="sidebar-inner">
            <h2 className="sidebar-title">Events in {year}</h2>

            <div className="sidebar-search">
              <Input className="search-input"
                name="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search event"
              />

              <Checkbox checked={hidePast} onChange={() => setHidePast(!hidePast)}>Hide past</Checkbox>
            </div>

            <EventList events={events && filteredEvents} year={year} hidePast={hidePast} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </aside>
        
        <main className={user ? '' : 'unclickable'}>
          <YearViewCalendar
          events={events && filteredEvents}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onDayClick={handleDayClick}
          year={year}
          onYearChange={handleYearChange}
          loading={loading}
        />
        </main>
      </Flex>

      <Modal
        title={editingEvent ? "Edit Event" : "Add Event"}
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <EventForm
          onSubmit={handleEventSubmit}
          initial={editingEvent || newEvent}
          onCancel={handleCancel}
        />
      </Modal>
    </div>
  );
}
