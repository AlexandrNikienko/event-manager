// src/storage.js
import { db, auth } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  deleteDoc
} from "firebase/firestore";

export async function loadEvents() {
  const user = auth.currentUser;
  if (!user) return []; // not logged in

  const eventsCol = collection(db, "users", user.uid, "events");
  const snapshot = await getDocs(eventsCol);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function saveEvent(event) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const eventsCol = collection(db, "users", user.uid, "events");
  if (event.id) {
    // update
    await setDoc(doc(eventsCol, event.id), event);
    return event.id;
  } else {
    // add new
    const docRef = await addDoc(eventsCol, event);
    return docRef.id;
  }
}

export async function deleteEvent(id) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const eventRef = doc(db, "users", user.uid, "events", id);
  await deleteDoc(eventRef);
}
