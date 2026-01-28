import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import nodemailer from "nodemailer";

// 1. Setup Firebase Admin (God Mode)
if (!getApps().length) {
  // We need to handle the private key newlines correctly for Netlify env vars
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined;

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = getFirestore();

// 2. Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Helper: Convert time string to ms
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

// Helper: Get event date object
function getEventDateTime(event) {
  if (!event.startDate) return new Date();
  
  // Note: Firestore Admin SDK might return Timestamp objects differently 
  // than client SDK, but if you store data as maps/numbers this logic holds.
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
    console.log(`✓ Email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to send email to ${userEmail}:`, error);
    return false;
  }
}

// --- V3 HANDLER ---

export default async (req) => {
  console.log("🔔 [send-reminders] Starting check...");
  
  try {
    // Admin SDK syntax is slightly different (collection().get())
    const usersSnapshot = await db.collection("users").get();
    
    let emailsSent = 0;
    const now = new Date();
    
    // Iterate over all users
    const userPromises = usersSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      const userEmail = userData.email;
      
      if (!userEmail) return;

      const eventsSnapshot = await db.collection("users").doc(userDoc.id).collection("events").get();
      
      const eventPromises = eventsSnapshot.docs.map(async (eventDoc) => {
        const eventData = eventDoc.data();
        
        if (!eventData.reminderTime || eventData.reminderSent) return;
        
        const eventDate = getEventDateTime(eventData);
        const reminderMs = getReminderMilliseconds(eventData.reminderTime);
        const reminderDate = new Date(eventDate.getTime() - reminderMs);
        
        const timeDiff = Math.abs(now.getTime() - reminderDate.getTime());
        
        // 10 minute window
        if (timeDiff < 10 * 60 * 1000) {
          console.log(`Found event due: ${eventData.name}`);
          const sent = await sendEmailReminder(userEmail, eventData);
          if (sent) {
            emailsSent++;
            // Mark as sent
            await db.collection("users").doc(userDoc.id).collection("events").doc(eventDoc.id).update({ 
              reminderSent: true 
            });
          }
        }
      });
      
      await Promise.all(eventPromises);
    });

    await Promise.all(userPromises);
    
    console.log(`✨ Done. Sent ${emailsSent} emails.`);
    return new Response(JSON.stringify({ message: "Success", emailsSent }), { status: 200 });

  } catch (error) {
    console.error("❌ Fatal Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const config = {
  schedule: "*/15 * * * *"
};