import { db, auth, saveUserEmail } from "../firebase";
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs } from "firebase/firestore";

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
