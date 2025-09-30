import { getFirestore, collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

const COLLECTION_NAME = 'events';

export const eventService = {
  // async getAllEvents() {
  //   const user = auth.currentUser;
  //   if (!user) throw new Error('User not authorized');

  //   const q = query(
  //     collection(db, COLLECTION_NAME),
  //     where("userId", "==", user.uid)
  //   );

  //   const querySnapshot = await getDocs(q);
  //   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  // },

  async getEventsByYear(year) {
    const user = auth.currentUser;
    console.log('Fetching events for user:', user);
    if (!user) throw new Error('User not authorized');

    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(event => event.isRecurring || event.year === year);
  },

  async addEvent(eventData) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authorized');

    const dataWithUser = { ...eventData, userId: user.uid };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), dataWithUser);

    console.log('Adding event:', dataWithUser);

    return { 
      id: docRef.id, 
      ...eventData 
    }
  },

  async updateEvent(id, eventData) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authorized');

    const eventRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(eventRef, { ...eventData, userId: user.uid });
    return { id, ...eventData };
  },

  async deleteEvent(id) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authorized');

    const eventRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(eventRef);
    return id;
  }
};
