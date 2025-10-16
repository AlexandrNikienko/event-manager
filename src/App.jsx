import React, { useState, useEffect, createContext } from "react";
import { Button, Flex, Modal, Input, Checkbox, Dropdown, Avatar, Spin, notification } from 'antd';
import { PlusOutlined, UserOutlined, QuestionOutlined, LogoutOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { useAuth } from "./AuthProvider.jsx";
import { eventService } from './services/eventService';
import { MONTH_NAMES } from "./utils/utils.js";
import EventForm from "./components/EventForm";
import YearViewCalendar from "./components/YearViewCalendar";
import { LoginButton } from "./components/LoginButton";
import EventList from "./components/EventList.jsx";
import rainbow from "./assets/rainbow.svg";
import Sider from "antd/es/layout/Sider.js";

// import { getFirestore, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
// const db = getFirestore();

export const GlobalStateContext = createContext(null);

export default function App() {
  const [modal, contextHolder] = Modal.useModal();
  const [note, notificationContextHolder] = notification.useNotification();

  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    if (loadingUser) return;
    if (!user) {
      setEvents([]);
      return;
    }
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
    if (!user) return;

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
        
        // Show success notification for editing
        note.success({
          message: 'Event Updated',
          description: `${eventData.name} has been successfully updated.`,
          placement: 'topRight',
        });
      } else {
        // Add new event
        const newEvent = await eventService.addEvent(eventData);
        setEvents([...events, newEvent]);
        
        // Show success notification for adding
        note.success({
          message: 'Event Created',
          description: `${eventData.name} has been successfully added.`,
          placement: 'topRight',
        });
      }
      setIsModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      
      // Show error notification
      note.error({
        message: 'Error',
        description: `Failed to ${editingEvent ? 'update' : 'create'} event. Please try again.`,
        placement: 'topRight',
      });
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
          
          // Show success notification for deletion
          note.info({
            message: 'Event Deleted',
            description: `${event.name} has been deleted.`,
            placement: 'topRight',
          });
        } catch (error) {
          console.error("Error deleting event:", error);
          
          // Show error notification
          note.error({
            message: 'Error',
            description: 'Failed to delete event. Please try again.',
            placement: 'topRight',
          });
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
      {notificationContextHolder}

      <header className="app-header">
        <div className="sidebar-extender" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </div>

        <h1><img className="logo" src={rainbow} alt="Logo" />Life Palette</h1>

        <Button className="create-event-btn" onClick={handleCreateEvent} type="primary" disabled={!user}>
          <PlusOutlined /> Add Event
        </Button>

        {user && loading && <div>Loading events...</div>}

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
                      <div className="mb8">
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
              />
            </Dropdown>
          )}
        </div>
      </header>

      <Flex gap="0" align="start">
        <Sider className="sidebar"
          trigger={null} 
          collapsible collapsed={!isSidebarOpen}
          collapsedWidth={0} width={300}
          theme="light"
        >
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
        </Sider>
        
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