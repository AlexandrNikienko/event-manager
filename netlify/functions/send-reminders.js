import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import nodemailer from "nodemailer";

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

// Email transporter using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Convert reminder time to milliseconds
 */
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

/**
 * Calculate event date/time
 */
function getEventDateTime(event) {
  let eventDate;
  
  if (event.isMultiDay) {
    eventDate = new Date(
      event.startDate.year,
      event.startDate.month - 1,
      event.startDate.day
    );
  } else {
    eventDate = new Date(
      event.startDate.year,
      event.startDate.month - 1,
      event.startDate.day
    );
  }
  
  eventDate.setHours(9, 0, 0, 0);
  return eventDate;
}

/**
 * Send email reminder using nodemailer
 */
async function sendEmailReminder(userEmail, event, reminderTime) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `📅 Reminder: ${event.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Event Reminder 🎉</h2>
        
        <p>Hi there!</p>
        
        <p>This is a reminder about your upcoming event:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${event.name}</h3>
          
          <p style="margin: 5px 0;"><strong>Type:</strong> ${event.type || "N/A"}</p>
          
          ${event.isMultiDay 
            ? `<p style="margin: 5px 0;"><strong>Date:</strong> ${event.startDate.month}/${event.startDate.day}/${event.startDate.year} - ${event.endDate.month}/${event.endDate.day}/${event.endDate.year}</p>`
            : `<p style="margin: 5px 0;"><strong>Date:</strong> ${event.startDate.month}/${event.startDate.day}/${event.startDate.year}</p>`
          }
          
          ${event.note ? `<p style="margin: 5px 0;"><strong>Note:</strong> ${event.note}</p>` : ""}
        </div>
        
        <p style="color: #666; font-size: 14px;">Don't forget to mark it on your calendar!</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px;">This is an automated reminder from Life Palette.</p>
      </div>
    `,
    text: `Event Reminder: ${event.name} on ${event.startDate.month}/${event.startDate.day}/${event.startDate.year}`,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Reminder email sent to ${userEmail} for "${event.name}"`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to send email to ${userEmail}:`, error);
    return false;
  }
}

/**
 * Main handler - Check for events that need reminders
 */
exports.handler = async function(event, context) {
  console.log("🔔 Reminder function triggered");

  console.log("ENV CHECK:", {
    service: process.env.EMAIL_SERVICE,
    user: process.env.EMAIL_USER,
    pass: !!process.env.EMAIL_PASSWORD
  });
  
  try {
    const usersCol = collection(db, "users");
    const usersSnapshot = await getDocs(usersCol);
    
    let remindersProcessed = 0;
    let emailsSent = 0;
    const now = new Date();
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const userEmail = userData.email;
      
      if (!userEmail) {
        console.warn(`User ${userId} has no email address`);
        continue;
      }
      
      // Get all events for this user
      const eventsCol = collection(db, "users", userId, "events");
      const eventsSnapshot = await getDocs(eventsCol);
      
      for (const eventDoc of eventsSnapshot.docs) {
        const event = eventDoc.data();
        const eventId = eventDoc.id;
        
        if (!event.reminderTime) continue;
        if (event.reminderSent) continue;
        
        const eventDate = getEventDateTime(event);
        const reminderMs = getReminderMilliseconds(event.reminderTime);
        const reminderDate = new Date(eventDate.getTime() - reminderMs);
        
        // Check if it's time to send the reminder (within 5 minutes window)
        const timeDiff = Math.abs(now.getTime() - reminderDate.getTime());
        
        if (timeDiff < 5 * 60 * 1000) {
          const sent = await sendEmailReminder(userEmail, event, event.reminderTime);
          
          if (sent) {
            emailsSent++;
            
            // Mark reminder as sent
            const eventRef = doc(db, "users", userId, "events", eventId);
            await updateDoc(eventRef, { reminderSent: true });
          }
          
          remindersProcessed++;
        }
      }
    }
    
    console.log(`✅ Reminder function completed: ${remindersProcessed} checked, ${emailsSent} sent`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Reminders processed successfully",
        remindersProcessed,
        emailsSent,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("❌ Error in reminder function:", error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process reminders",
        details: error.message,
      }),
    };
  }
}
