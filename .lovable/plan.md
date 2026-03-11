

# Email Notifications for Contact Form Submissions

## Overview
Add email notifications so you receive an immediate alert whenever someone submits a message through the contact form on your landing page.

## How It Will Work
1. When a visitor submits the contact form, the message gets saved to the database (already working)
2. After saving, the frontend will call a new edge function to send you an email notification
3. You'll receive an email with the sender's name, email, subject, and message content

## What You'll Need to Provide
**Resend API Key** - We'll use Resend.com for reliable email delivery. You'll need to:
1. Sign up at https://resend.com (free tier includes 100 emails/day)
2. Add and verify your email domain at https://resend.com/domains
3. Create an API key at https://resend.com/api-keys

## Implementation Steps

### Step 1: Create the Email Notification Edge Function
Create a new `supabase/functions/send-contact-notification/index.ts` that:
- Receives contact form data (name, email, subject, message)
- Fetches your profile email from the database as the recipient
- Sends a formatted HTML email using Resend
- Includes proper CORS handling and error responses

### Step 2: Update Supabase Configuration
Add the new function to `supabase/config.toml` with `verify_jwt = false` so it can be called from the public contact form.

### Step 3: Update the Contact Form
Modify `src/components/sections/ContactSection.tsx` to:
- Call the new edge function after successfully saving the message to the database
- Handle the notification in the background (non-blocking)
- Not affect the user experience if the email fails to send

---

## Technical Details

### Edge Function Structure
```text
supabase/functions/send-contact-notification/
  └── index.ts
```

### Email Template
The notification email will include:
- Subject: "New Contact Form Message: [Subject]" or "New Contact Form Message from [Name]"
- Sender details (name and email with reply link)
- Message content
- Timestamp
- Direct link to reply via email

### Security Considerations
- The edge function only sends to your profile email (not user-provided)
- No sensitive data is exposed
- Rate limiting is handled by Resend's API

### Files to Create/Modify
| File | Action |
|------|--------|
| `supabase/functions/send-contact-notification/index.ts` | Create |
| `supabase/config.toml` | Add function config |
| `src/components/sections/ContactSection.tsx` | Add edge function call |

