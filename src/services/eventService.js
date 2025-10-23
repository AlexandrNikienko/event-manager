import { db, auth } from "../firebase";
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs } from "firebase/firestore";

export const eventService = {
  async getEventsByYear(year) {
    const user = auth.currentUser;
    console.log("getEventsByYear", user)
    if (!user) throw new Error("User not authorized");

    const eventsCol = collection(db, "users", user.uid, "events");
    const snapshot = await getDocs(eventsCol);

    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(event => event.isRecurring || event.year === year);
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
