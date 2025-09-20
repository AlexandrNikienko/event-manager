import { getFirestore, collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, where, or } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'events';

export const eventService = {
  // Get all events
  async getAllEvents() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  },

  // Get events for specific year
  async getEventsByYear(year) {
    try {
      // Query for both year-specific events and recurring events
      const q = query(
        collection(db, COLLECTION_NAME),
        or(
          where("year", "==", year),
          where("isRecurring", "==", true)
        )
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching events by year:', error);
      throw new Error('Failed to fetch events');
    }
  },

  // Add new event
  async addEvent(eventData) {
    console.log('Adding event:', eventData);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), eventData);
    return {
      id: docRef.id,
      ...eventData
    };
  },

  // Update event
  async updateEvent(id, eventData) {
    console.log('Updating event:', eventData);
    const eventRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(eventRef, eventData);
    return {
      id,
      ...eventData
    };
  },

  // Delete event
  async deleteEvent(id) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return id;
  }
};