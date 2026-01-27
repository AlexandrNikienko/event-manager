# Email Reminder System

The reminder system sends email notifications to users before their events occur.

## Features

- ✅ Set reminders for individual events (15m, 1h, 3h, 1d, 3d, 1w before event)
- ✅ Automatic email notifications 
- ✅ Works with single-day and multi-day events
- ✅ Scheduled to run every 5 minutes
- ✅ Prevents duplicate reminders

## Setup

### 1. Environment Variables

Add these to your Netlify environment variables (Site Settings → Build & Deploy → Environment):

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**For Gmail:**
- Use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password
- Enable 2-step verification first
- Create an app-specific password for this application

**Alternative Email Providers:**
- SendGrid
- Mailgun
- Any SMTP provider supported by Nodemailer

### 2. Database Structure

Events now have these fields:
- `reminderTime` (string): The reminder time (e.g., "1d", "3h", null for no reminder)
- `reminderSent` (boolean): Tracks if reminder was already sent

### 3. How It Works

1. User creates event with reminder time (e.g., "1 day before")
2. Scheduled function runs every 5 minutes
3. Function checks all events for matching reminder times
4. If reminder time matches, email is sent
5. `reminderSent` flag is set to prevent duplicates

## Usage in App

In the EventForm, users can select:
- No reminder
- 15 minutes before
- 1 hour before
- 3 hours before
- 1 day before
- 3 days before
- 1 week before

## Email Format

Reminder emails include:
- Event name and type
- Event date/date range
- Event notes
- Professional HTML template

## Testing

To test locally:

```bash
npm install
npm run dev
```

Create an event with a reminder. The scheduled function will run every 5 minutes in production.

For local testing of the function:
```bash
curl -X POST http://localhost:9000/.netlify/functions/send-reminders
```

## Troubleshooting

**Emails not sending:**
- Check environment variables are set correctly
- Verify email service credentials
- Check Netlify function logs
- Ensure Firebase has user email stored

**Duplicate reminders:**
- Clear `reminderSent` flag manually from Firebase if needed
- Function includes deduplication logic

**Timing issues:**
- Reminders are checked within 5-minute windows
- Function runs every 5 minutes
- Events set to 9 AM on the event date

## Files Modified

- `src/components/EventForm.jsx` - Added reminder time selection
- `netlify/functions/send-reminders.js` - Main reminder function
- `netlify/functions/send-reminders.json` - Schedule configuration
- `package.json` - Added nodemailer dependency
