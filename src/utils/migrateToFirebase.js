import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { events as localEvents } from './events';

export const migrateEventsToFirebase = async () => {
  try {
    const eventsCollection = collection(db, 'events');
    
    for (const event of localEvents) {
      // Remove id and create a new object with remaining properties
      const { id, ...eventWithoutId } = event;
      
      // Add event to Firestore
      await addDoc(eventsCollection, eventWithoutId);
    }
    
    console.log('Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};