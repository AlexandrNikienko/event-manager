import { db, auth, saveUserEmail } from "../firebase";
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, getDoc } from "firebase/firestore";

export const eventService = {
  async getEventsByYear(year) {
    const user = auth.currentUser;
    console.log("getEventsByYear", user)
    if (!user) throw new Error("User not authorized");

    // Save user email to Firestore
    await saveUserEmail(user);

    const eventsCol = collection(db, "users", user.uid, "events");
    const snapshot = await getDocs(eventsCol);

    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(event => {
        // Include recurring events
        if (event.isRecurring) return true;
        
        // Include events with old format
        if (event.year === year) return true;
        
        // Include single-day events that match the year
        if (event.startDate?.year === year) return true;
        
        // Include multi-day events that overlap with this year
        if (event.isMultiDay) {
          const startYear = event.startDate?.year;
          const endYear = event.endDate?.year;
          return startYear <= year && endYear >= year;
        }
        
        return false;
      });
  },

  async addEvent(eventData) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authorized");

    const eventsCol = collection(db, "users", user.uid, "events");
    const docRef = await addDoc(eventsCol, eventData);
    return { id: docRef.id, ...eventData };
  },

  async updateEvent(id, eventData) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authorized");

    const eventRef = doc(db, "users", user.uid, "events", id);

    /* Reset reminderSent to false if reminder time or date changed */
    // Fetch existing event to compare fields
    const existingSnap = await getDoc(eventRef);
    if (!existingSnap.exists()) {
      await updateDoc(eventRef, eventData);
      return { id, ...eventData };
    }

    const existing = existingSnap.data();

    // helper to map reminder label to ms (same as function used in send-reminders)
    const reminderToMs = (reminderTime) => {
      const map = {
        "15m": 15 * 60 * 1000,
        "1h": 60 * 60 * 1000,
        "3h": 3 * 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
        "3d": 3 * 24 * 60 * 60 * 1000,
        "1w": 7 * 24 * 60 * 60 * 1000,
      };
      return map[reminderTime] || 0;
    };

    const startChanged = JSON.stringify(existing.startDate || null) !== JSON.stringify(eventData.startDate || null);
    const endChanged = JSON.stringify(existing.endDate || null) !== JSON.stringify(eventData.endDate || null);
    const reminderChanged = (existing.reminderTime || null) !== (eventData.reminderTime || null);

    // If reminder was already sent, and we changed the date/reminder, and the new reminder is in future -> reset reminderSent
    if (existing.reminderSent && (startChanged || endChanged || reminderChanged)) {
      const s = eventData.startDate || existing.startDate;
      const r = eventData.reminderTime ?? existing.reminderTime;

      if (s && r) {
        const eventDate = new Date(s.year, s.month - 1, s.day);
        eventDate.setHours(9, 0, 0, 0);
        const reminderDate = new Date(eventDate.getTime() - reminderToMs(r));

        if (reminderDate.getTime() > Date.now()) {
          eventData = { ...eventData, reminderSent: false };
        }
      } else if (s && !r) {
        // No reminder time configured anymore — ensure reminderSent reset so user can re-enable later
        eventData = { ...eventData, reminderSent: false };
      }
    }
    /* End reset reminderSent logic */

    await updateDoc(eventRef, eventData);
    return { id, ...eventData };
  },

  async deleteEvent(id) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authorized");

    const eventRef = doc(db, "users", user.uid, "events", id);
    await deleteDoc(eventRef);
    return id;
  }
};
