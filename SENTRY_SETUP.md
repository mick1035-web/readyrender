# Sentry Error Tracking Setup

This project uses Sentry for production error tracking and monitoring.

## Quick Setup

1. **Create a Sentry Account**
   - Go to https://sentry.io and create a free account
   - Create a new project and select "Next.js"

2. **Get Your DSN**
   - After creating the project, copy your DSN from the project settings
   - It looks like: `https://public_key@sentry.io/project_id`

3. **Add to Environment Variables**
   - Add to your `.env.local` file:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
   ```

4. **Deploy**
   - Sentry will automatically start capturing errors in production
   - Errors in development are logged to console only (not sent to Sentry)

## Features Enabled

- ✅ Client-side error tracking
- ✅ Server-side error tracking
- ✅ Edge runtime error tracking
- ✅ User context (email, ID)
- ✅ Error severity levels
- ✅ Custom error context
- ✅ Session replay (10% sample rate)
- ✅ Error filtering (browser extensions, known issues)

## What Gets Tracked

All errors handled through our `errorHandler` are automatically sent to Sentry with:
- Error type and severity
- User information (if logged in)
- Error description and solutions
- Stack traces
- Browser and device information

## Privacy

- Passwords and sensitive data are never sent
- Session replays mask all text and media
- Development errors are not sent to Sentry

## Free Tier Limits

- 5,000 errors/month
- 10,000 performance units/month
- 30 days data retention

This is sufficient for most small to medium applications.
