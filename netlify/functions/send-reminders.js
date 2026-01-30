import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import nodemailer from "nodemailer";

// --- FIX: Robust Private Key Parsing ---
function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;

  // 1. Remove surrounding quotes if user pasted them from JSON
  const cleanKey = key.replace(/^"|"$/g, '');

  // 2. Handle standard PEM formatting
  // If the key already has real newlines, this won't hurt. 
  // If it has literal "\n" characters (from JSON), this fixes them.
  return cleanKey.replace(/\\n/g, '\n');
}

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: getPrivateKey(), // <--- USE THE HELPER FUNCTION
      }),
    });
  } catch (error) {
    console.error("❌ Firebase Admin Init Error:", error);
  }
}

const db = getFirestore();

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter on startup to catch misconfigurations early
(async () => {
  try {
    await transporter.verify();
    console.log("📧 [send-reminders] Mail transporter verified");
  } catch (err) {
    console.error("❌ [send-reminders] Mail transporter verification failed:", err);
  }
})();
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
    subject: `📅 Life Pallete Reminder: ${event.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Event Reminder 🎉</h2>
        <p>This is a reminder about your upcoming event: <strong>${event.name}</strong></p>
        <p>Date: ${event.startDate.month}/${event.startDate.day}/${event.startDate.year}</p>
        </br>
        <p>Don't forget to check <a href="https://life-pallete.netlify.app">your app</a> for more details!</p>
        <p>Best regards,<br/>Life Pallete Team</p>
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
  console.log("📋 Environment check:", {
    emailService: process.env.EMAIL_SERVICE,
    emailUser: process.env.EMAIL_USER,
    //emailPassword: !!process.env.EMAIL_PASSWORD,
  });
  
  try {
    console.log("🔍 Fetching users from Firebase...");

    // Admin SDK syntax is slightly different (collection().get())
    const usersSnapshot = await db.collection("users").get();

    console.log(`👥 Found ${usersSnapshot.docs.length} user(s)`);
    
    let emailsSent = 0;
    const now = new Date();
    
    // Configurable time window (minutes) to catch reminders — should be >= schedule interval
    const WINDOW_MINUTES = parseInt(process.env.REMINDER_WINDOW_MINUTES || "10", 10);
    const WINDOW_MS = WINDOW_MINUTES * 60 * 1000;

    // Allow manual test invocation via query param: ?test=1&to=email@example.com
    const url = req?.url || "";
    const searchParams = typeof URL !== "undefined" ? new URL(url, "http://localhost")?.searchParams : null;
    const isTest = searchParams?.get("test") === "1";
    const testTo = searchParams?.get("to");

    /*If you want an immediate test, call the function/url with query params: ?test=1&to=you@example.com*/
    if (isTest) {
      const to = testTo || process.env.TEST_TO_EMAIL || "";
      if (!to) {
        console.warn("⚠️ [send-reminders] Test invoked but no target email provided (query param 'to' or env TEST_TO_EMAIL)");
      } else {
        console.log(`🧪 [send-reminders] Sending test email to ${to}`);
        await sendEmailReminder(to, { name: "Test reminder", startDate: { month: "--", day: "--", year: "--" } });
      }
    }

    // Iterate over all users
    const userPromises = usersSnapshot.docs.map(async (userDoc) => {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const userEmail = userData?.userEmail || userData?.email;

      console.log(`👤 userId=${userId} userEmail=${userEmail}`);
      
      if (!userEmail) {
        console.warn(`⚠️ User ${userId} has no email address`);
        return;
      }

      console.log(`📧 Processing user: ${userEmail}`);

      const eventsSnapshot = await db.collection("users").doc(userDoc.id).collection("events").get();
      
      const eventPromises = eventsSnapshot.docs.map(async (eventDoc) => {
        const eventData = eventDoc.data();
        
        if (!eventData.reminderTime || eventData.reminderSent) return;

        console.log(`⏳ Calculating reminder for event: ${eventData.name}`);
        
        const eventDate = getEventDateTime(eventData);
        const reminderMs = getReminderMilliseconds(eventData.reminderTime);
        const reminderDate = new Date(eventDate.getTime() - reminderMs);
        const timeDiff =  reminderDate.getTime() - now.getTime()

        console.log(`⏰ Event "${eventData.name}": eventDate=${eventDate.toISOString()}, reminderTime=${eventData.reminderTime}, reminderDate=${reminderDate.toISOString()}, now=${now.toISOString()}, timeDiffMins=${Math.round(timeDiff / 1000 / 60)}, windowMinutes=${WINDOW_MINUTES}`);
        
        // If reminder is within the configured window
        if (timeDiff > 0 && timeDiff <= WINDOW_MS) {
          console.log(`Found event due: ${eventData.name}`);

          const sent = await sendEmailReminder(userEmail, eventData);

          if (sent) {
            emailsSent++;
            // Mark as sent
            await db.collection("users").doc(userDoc.id).collection("events").doc(eventDoc.id).update({ 
              reminderSent: true 
            });

            console.log(`✅ Marked reminder as sent for "${eventData.name}"`);
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

// Keep schedule consistent with `netlify.toml` (set to every 15 minutes)
export const config = {
  schedule: "*/5 * * * *"
};