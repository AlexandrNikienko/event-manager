import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import nodemailer from "nodemailer";
import { schedule } from "@netlify/functions"; // <--- IMPORT THIS

console.log("The send-reminders function loaded");

const firebaseConfig = {
  apiKey: "AIzaSyC80-ofeALeRh2N-WQpNsW6sSTE_Itnw-s",
  authDomain: "event-calendar-f145e.firebaseapp.com",
  projectId: "event-calendar-f145e",
  storageBucket: "event-calendar-f145e.firebasestorage.app",
  messagingSenderId: "994383053852",
  appId: "1:994383053852:web:e139b2a98cce257c8bcbd9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function getReminderMilliseconds(reminderTime) {
  const times = {
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "3h": 3 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "3d": 3 * 24 * 60 * 60 * 1000,
    "1w": 7 * 24 * 60 * 60 * 1000,
  };
  return times[reminderTime] || 0;
}

function getEventDateTime(event) {
  let eventDate = new Date(
    event.startDate.year,
    event.startDate.month - 1,
    event.startDate.day
  );
  eventDate.setHours(9, 0, 0, 0);
  return eventDate;
}

async function sendEmailReminder(userEmail, event) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `📅 Reminder: ${event.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Event Reminder 🎉</h2>
        <p>This is a reminder about your upcoming event: <strong>${event.name}</strong></p>
        <p>Date: ${event.startDate.month}/${event.startDate.day}/${event.startDate.year}</p>
      </div>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`✗ Failed to send email to ${userEmail}:`, error);
    return false;
  }
}

// THE MAIN HANDLER LOGIC
const myHandler = async (event, context) => {
  console.log("🔔 [send-reminders] Function triggered at", new Date().toISOString());
  
  try {
    const usersCol = collection(db, "users");
    const usersSnapshot = await getDocs(usersCol);
    let emailsSent = 0;
    const now = new Date();
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userEmail = userData.email;
      if (!userEmail) continue;

      const eventsCol = collection(db, "users", userDoc.id, "events");
      const eventsSnapshot = await getDocs(eventsCol);
      
      for (const eventDoc of eventsSnapshot.docs) {
        const eventData = eventDoc.data();
        if (!eventData.reminderTime || eventData.reminderSent) continue;
        
        const eventDate = getEventDateTime(eventData);
        const reminderMs = getReminderMilliseconds(eventData.reminderTime);
        const reminderDate = new Date(eventDate.getTime() - reminderMs);
        
        // Check if within 10 minutes (to match your 15m cron schedule safe window)
        const timeDiff = Math.abs(now.getTime() - reminderDate.getTime());
        
        if (timeDiff < 10 * 60 * 1000) {
          const sent = await sendEmailReminder(userEmail, eventData);
          if (sent) {
            emailsSent++;
            await updateDoc(doc(db, "users", userDoc.id, "events", eventDoc.id), { reminderSent: true });
          }
        }
      }
    }
    
    return { statusCode: 200 };
  } catch (error) {
    console.error("❌ Error:", error);
    return { statusCode: 500 };
  }
};

// WRAP THE HANDLER WITH THE SCHEDULE
export const handler = schedule("*/15 * * * *", myHandler);