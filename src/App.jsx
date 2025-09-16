import React, { useState, useEffect } from "react";
import YearViewCalendar from "./components/YearViewCalendar";
import BirthdayForm from "./components/BirthdayForm";
import { loadBirthdays, saveBirthdays } from "./utils/storage";

export default function App() {
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    setBirthdays(loadBirthdays());
  }, []);

  const addBirthday = (payload) => {
    const newItem = { id: String(Date.now()), ...payload };
    updateBirthdays([...birthdays, newItem]);
  };

  const deleteBirthday = (id) => {
    updateBirthdays(birthdays.filter((b) => b.id !== id));
  };

  // Call this when you add/delete birthdays
  const updateBirthdays = (newList) => {
    setBirthdays(newList);
    saveBirthdays(newList);
  };

  const handleEdit = (id, changes) => {
    const updated = birthdays.map(b =>
      b.id === id ? { ...b, ...changes } : b
    );
    updateBirthdays(updated);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Yearly Birthdays</h1>
        <p className="sub">Enter birthdays and view them in a 12-month year view.</p>
      </header>

      <main>
        <div className="controls">
          <BirthdayForm onAdd={addBirthday} />
        </div>

        <YearViewCalendar
          birthdays={birthdays}
          onDelete={id => updateBirthdays(birthdays.filter(b => b.id !== id))}
          onEdit={handleEdit}
        />
      </main>

      <footer className="app-footer">
        <small>Built with React — data is mock JSON and kept in memory.</small>
      </footer>
    </div>
  );
}
