# Email Reminder System Setup

The reminder system sends email notifications to users before their events occur using your email service.

## ⚡ Quick Start

Your environment variables are already configured in Netlify:
- ✅ `EMAIL_SERVICE` 
- ✅ `EMAIL_USER`
- ✅ `EMAIL_PASSWORD`

The reminder function is ready to use!

## 🔧 How It Works

1. **Create Event with Reminder**:
   - In EventForm, select reminder time (15m, 1h, 3h, 1d, 3d, 1w before event)
   - Save the event

2. **Scheduled Function Runs**:
   - Function runs every 5 minutes (configured in `netlify.toml`)
   - Checks all events for matching reminder times
   - Sends email 5 minutes before the reminder time

3. **Email Sent**:
   - Beautiful HTML email with event details
   - Includes: event name, type, date range, notes
   - `reminderSent` flag prevents duplicate emails

## 📧 Environment Variables Used

| Variable | Purpose |
|----------|---------|
| `EMAIL_SERVICE` | Email service (gmail, outlook, etc.) |
| `EMAIL_USER` | Your email address |
| `EMAIL_PASSWORD` | Email password/app password |

## 🧪 Testing

To test manually:

```bash
# Deploy your changes
git push origin main

# Check Netlify function logs
# Netlify Dashboard → Functions → send-reminders → Invocations
```

## 🚀 Features

- ✅ Automatic email reminders
- ✅ Configurable reminder times
- ✅ Works with single-day and multi-day events
- ✅ Prevents duplicate reminders
- ✅ Professional HTML emails
- ✅ Runs every 5 minutes
- ✅ Uses your existing email service

## 📝 Reminder Times Available

- 15 minutes before
- 1 hour before
- 3 hours before
- 1 day before
- 3 days before
- 1 week before
- No reminder (default)

## 🔍 Troubleshooting

**Reminders not sending?**
- ✓ Verify `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD` in Netlify
- ✓ Check Netlify function logs for errors
- ✓ Ensure event has reminder time selected
- ✓ Event must be in the future

**Emails going to spam?**
- For Gmail: Enable "Less secure app access" or use app-specific password
- Check your email service spam settings

**Want to reset reminders?**
- Manually delete `reminderSent` field from event in Firebase to resend

## 📄 Files Modified

- `src/components/EventForm.jsx` - Added reminder time selection
- `netlify/functions/send-reminders.js` - Main reminder function
- `netlify.toml` - Added scheduled function configuration
- `package.json` - Added nodemailer dependency
