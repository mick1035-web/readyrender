# Sentry Setup Verification Checklist

## Pre-Setup Verification ✅

### Code Integration Status
- ✅ Sentry SDK installed (@sentry/nextjs)
- ✅ Client configuration created (sentry.client.config.ts)
- ✅ Server configuration created (sentry.server.config.ts)
- ✅ Edge configuration created (sentry.edge.config.ts)
- ✅ Next.js config wrapped with Sentry
- ✅ errorHandler integrated with Sentry
- ✅ User context tracking in AuthContext
- ✅ Production build successful

### What's Ready
All code is in place and ready to send errors to Sentry once you add the DSN.

---

## Setup Steps (User Action Required)

### Step 1: Create Sentry Account
1. Go to https://sentry.io
2. Click "Get Started" or "Sign Up"
3. Sign up with email or GitHub/Google
4. Verify your email address

### Step 2: Create Project
1. After login, click "Create Project"
2. Select platform: **Next.js**
3. Set alert frequency (recommended: "Alert me on every new issue")
4. Name your project (e.g., "3d-video-gen")
5. Click "Create Project"

### Step 3: Get Your DSN
After project creation, you'll see:
```
Client Keys (DSN)
https://[PUBLIC_KEY]@o[ORG_ID].ingest.sentry.io/[PROJECT_ID]
```

Copy this entire URL - this is your DSN.

### Step 4: Add DSN to Environment
1. Open your `.env.local` file
2. Add this line:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://[YOUR_DSN_HERE]
   ```
3. Save the file

### Step 5: Restart Development Server
```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

---

## Verification After Setup

### Test 1: Check Console (Development)
1. Start dev server: `npm run dev`
2. Trigger an error (upload invalid file)
3. Check browser console
4. Should see: "Sentry event (not sent in dev):" with event details

**Expected Result:**
- ✅ Error logged to console
- ✅ Event object shows error details
- ✅ NOT sent to Sentry (development mode)

### Test 2: Production Error Tracking
1. Build for production: `npm run build`
2. Start production server: `npm run start`
3. Login to application
4. Trigger an error (upload invalid file)
5. Go to Sentry dashboard

**Expected in Sentry Dashboard:**
- ✅ New error event appears
- ✅ Error title: "Invalid File Format"
- ✅ Tags: errorType, severity
- ✅ User context: email, ID
- ✅ Error context: description, solutions
- ✅ Stack trace visible

### Test 3: User Context
1. While logged in, trigger another error
2. Check Sentry event details
3. Look for "User" section

**Expected:**
- ✅ User ID matches Firebase UID
- ✅ Email address visible
- ✅ Error associated with user

---

## Troubleshooting

### Errors Not Appearing in Sentry

**Check 1: DSN Configured**
```bash
# In your terminal
echo $NEXT_PUBLIC_SENTRY_DSN
# Should show your DSN
```

**Check 2: Production Mode**
```bash
# Ensure you're running production build
npm run build
npm run start
# NOT npm run dev
```

**Check 3: Network**
- Check browser DevTools → Network tab
- Look for requests to `sentry.io`
- Should see POST requests when errors occur

**Check 4: Console**
- Check browser console for Sentry errors
- Look for "Sentry" related messages

### DSN Not Working

**Verify DSN Format:**
```
✅ Correct: https://abc123@o123456.ingest.sentry.io/7890123
❌ Wrong: abc123 (just the key)
❌ Wrong: missing https://
```

**Check Environment Variable:**
- Must be `NEXT_PUBLIC_SENTRY_DSN` (exact name)
- Must be in `.env.local` file
- Restart server after adding

---

## Quick Verification Commands

```bash
# 1. Check if Sentry is installed
npm list @sentry/nextjs

# 2. Check if DSN is set (in development)
# Open browser console and type:
console.log(process.env.NEXT_PUBLIC_SENTRY_DSN)

# 3. Build and verify no errors
npm run build

# 4. Start production server
npm run start
```

---

## Success Indicators

### In Development
- ✅ Console shows "Sentry event (not sent in dev)"
- ✅ Event object contains error details
- ✅ No network requests to Sentry

### In Production
- ✅ Errors appear in Sentry dashboard within seconds
- ✅ User context attached to errors
- ✅ Error details include solutions
- ✅ Stack traces are readable

---

## Next Steps After Verification

1. **Set Up Alerts**
   - Go to Sentry → Alerts
   - Configure email notifications
   - Set up Slack integration (optional)

2. **Create Dashboard**
   - Monitor error rates
   - Track most common errors
   - View affected users

3. **Configure Sampling**
   - Adjust `tracesSampleRate` if needed
   - Modify `replaysSessionSampleRate` for performance

4. **Invite Team**
   - Add team members to Sentry project
   - Set up role-based access

---

## Current Status

- ✅ **Code**: Fully integrated and tested
- ⏳ **Account**: Needs to be created by user
- ⏳ **DSN**: Needs to be added to .env.local
- ⏳ **Verification**: Pending DSN configuration

**Once you add the DSN, error tracking will work automatically!**
