# Khazaana Monitoring Dashboard Setup Guide

## 📊 Complete Monitoring Setup (30 minutes)

This guide will help you set up:
1. **Sentry** - Error tracking with email alerts
2. **LogRocket** - Session replay & user journey
3. **Google Apps Script** - Daily email reports
4. **UptimeRobot** - Website monitoring with alerts

---

## 🔧 1. SENTRY SETUP (10 minutes)

### Step 1: Create Account
1. Go to [sentry.io](https://sentry.io)
2. Click "Sign up" → Use Google account
3. Choose "Free" plan (5,000 errors/month)

### Step 2: Create Project
1. After login, click "Create Project"
2. Select: **JavaScript → Browser → Astro**
3. Project name: `khazaana`
4. Click "Create Project"

### Step 3: Get DSN
1. After project creation, you'll see a DSN like:
   ```
   https://a1b2c3d4e5f6g7h8@o123456.ingest.sentry.io/4567890
   ```
2. Copy this DSN

### Step 4: Update Code
1. Open `src/lib/monitoring.ts`
2. Replace `YOUR_SENTRY_DSN` with your actual DSN:
   ```typescript
   SENTRY_DSN: 'https://a1b2c3d4e5f6g7h8@o123456.ingest.sentry.io/4567890',
   ```

### Step 5: Set Up Email Alerts
1. In Sentry, go to **Settings → Alerts → Rules**
2. Click "Create New Rule"
3. Configure:
   - **Rule Name**: `Khazaana Critical Errors`
   - **Issue Triggers**: 
     - When an issue occurs
     - Level: `Error` or `Fatal`
     - Environment: `production`
   - **Actions**:
     - Email: Add all 3 emails:
       - shr6219@gmail.com
       - helpkhazaana@gmail.com
       - Mdaskinali@gmail.com
4. Click "Save Rule"

### Step 6: Create Additional Rules
1. **Performance Alerts**:
   - Rule Name: `Slow Page Loads`
   - Trigger: Transaction duration > 5 seconds
   - Email: All 3 emails

2. **New Release Alerts**:
   - Rule Name: `New Deployment`
   - Trigger: New release detected
   - Email: All 3 emails

### Step 7: View Dashboard
- Go to: [sentry.io](https://sentry.io)
- Select `khazaana` project
- Dashboard shows:
  - Error count
  - Performance metrics
  - User sessions
  - Geographic distribution

---

## 📹 2. LOGROCKET SETUP (10 minutes)

### Step 1: Create Account
1. Go to [logrocket.com](https://logrocket.com)
2. Click "Start free trial"
3. Email: Use any of the team emails
4. Plan: **Free** (1,000 sessions/month)

### Step 2: Create Organization & Project
1. Organization: `Khazaana`
2. Project: `khazaana-web`
3. Framework: **React/JavaScript**

### Step 3: Get App ID
1. After project creation, you'll see:
   ```
   org/app-id
   ```
2. Copy this App ID

### Step 4: Update Code
1. Open `src/lib/monitoring.ts`
2. Replace `YOUR_LOGROCKET_APP_ID`:
   ```typescript
   LOGROCKET_APP_ID: 'khazaana/khazaana-web',
   ```

### Step 5: Set Up Email Alerts
1. In LogRocket, go to **Settings → Notifications**
2. Create alert rules:
   - **Error Alerts**: When JavaScript errors occur
   - **Performance Alerts**: When page load > 3 seconds
   - **User Alerts**: When users encounter errors
3. Add all 3 emails to notifications

### Step 6: View Dashboard
- Go to: [app.logrocket.com](https://app.logrocket.com)
- Select `khazaana-web` project
- Features:
  - **Session Replay**: Watch user sessions
  - **Console Logs**: See all console errors
  - **Network Requests**: Monitor API calls
  - **User Journeys**: Track user paths

---

## 🤖 3. GOOGLE APPS SCRIPT SETUP (5 minutes)

### Step 1: Create Script
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Delete default code

### Step 2: Paste Code
Copy the entire code from `MONITORING_SETUP.md` (lines 16-350)

### Step 3: Deploy as Web App
1. Click **Deploy → New Deployment**
2. Type: **Web app**
3. Description: `Khazaana Alert System`
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Click **Deploy**
7. Authorize permissions
8. Copy the Web app URL

### Step 4: Update Code
1. Open `src/lib/monitoring.ts`
2. Replace `YOUR_APPS_SCRIPT_WEBHOOK_URL`:
   ```typescript
   ALERT_WEBHOOK_URL: 'https://script.google.com/macros/s/ABC123XYZ/exec',
   ```

### Step 5: Set Up Triggers
1. In Apps Script editor, press **Ctrl+Enter** (or **⌘+Enter** on Mac)
2. Type `setupAllTriggers` and press Enter
3. This creates:
   - Daily report at 9 PM IST
   - Hourly website checks

### Step 6: Test
1. Open browser console on your website
2. Run:
   ```javascript
   fetch('YOUR_WEBHOOK_URL', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       subject: 'Test Alert',
       data: { message: 'This is a test' },
       timestamp: new Date().toISOString(),
       url: window.location.href
     })
   });
   ```
3. Check email for test alert

---

## 🔍 4. UPTIMEROBOT SETUP (5 minutes)

### Step 1: Create Account
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account
3. Verify email

### Step 2: Add Monitors
1. Click **Add New → HTTP(s) Monitor**
2. Monitor 1:
   - Friendly Name: `Khazaana Home`
   - URL: `https://khazaana.co.in`
   - Interval: 5 minutes
3. Monitor 2:
   - Friendly Name: `Khazaana Restaurants`
   - URL: `https://khazaana.co.in/restaurants`
   - Interval: 5 minutes
4. Monitor 3:
   - Friendly Name: `Khazaana Cart`
   - URL: `https://khazaana.co.in/cart`
   - Interval: 5 minutes

### Step 3: Set Up Alerts
1. Go to **My Settings → Alert Contacts**
2. Add **Email** contacts:
   - shr6219@gmail.com
   - helpkhazaana@gmail.com
   - Mdaskinali@gmail.com
3. Go to **Edit Monitors**
4. For each monitor, add all 3 emails to alert contacts

### Step 4: View Dashboard
- Go to: [uptimerobot.com](https://uptimerobot.com)
- See:
  - Uptime percentage
  - Response times
  - Downtime history
  - Status page link

---

## 📊 5. GOOGLE ANALYTICS 4 (Already Set Up)

### View Dashboard
1. Go to [analytics.google.com](https://analytics.google.com)
2. Select property: `Khazaana`
3. Reports:
   - **Realtime**: See active users now
   - **Reports → Engagement**: Page views, time on site
   - **Reports → Events**: Track add to cart, orders
   - **Reports → Demographics**: User locations

### Set Up Email Alerts
1. In GA4, go to **Admin → Custom Alerts**
2. Create alerts for:
   - High bounce rate
   - Low page views
   - Conversion drops

---

## 📱 6. OPTIONAL: MOBILE PUSH NOTIFICATIONS

### For instant alerts on phone:
1. **PagerDuty** (free tier):
   - Create account
   - Set up integration with Sentry
   - Get push notifications for critical errors

2. **Pushover** ($5 one-time):
   - Install app on phone
   - Create API key
   - Integrate with Apps Script

---

## 📧 WHAT YOU'LL RECEIVE

| Alert Type | When | Where | Who Gets It |
|------------|------|-------|------------|
| **Site Down** | Immediately | Email | All 3 emails |
| **JavaScript Error** | Immediately | Email | All 3 emails |
| **Slow Performance** | Immediately | Email | All 3 emails |
| **Daily Report** | 9 PM IST | Email | All 3 emails |
| **New Order** | Immediately | Email | All 3 emails |

---

## 🎯 DASHBOARD LINKS (Save These)

| Service | Dashboard URL | Purpose |
|---------|---------------|---------|
| **Sentry** | [sentry.io](https://sentry.io) | Errors & Performance |
| **LogRocket** | [app.logrocket.com](https://app.logrocket.com) | Session Replay |
| **Google Analytics** | [analytics.google.com](https://analytics.google.com) | User Analytics |
| **UptimeRobot** | [uptimerobot.com](https://uptimerobot.com) | Uptime Status |
| **Vercel** | [vercel.com/dashboard](https://vercel.com/dashboard) | Deploy & Analytics |

---

## 🚀 QUICK START CHECKLIST

1. [ ] Create Sentry account → Get DSN → Update code
2. [ ] Create LogRocket account → Get App ID → Update code  
3. [ ] Create Apps Script → Deploy → Get URL → Update code
4. [ ] Create UptimeRobot monitors → Add emails
5. [ ] Test all alerts
6. [ ] Save dashboard links

---

## 🆘 TROUBLESHOOTING

### Not receiving emails?
1. Check spam folder
2. Verify webhook URL is correct
3. Test with console command
4. Check Apps Script execution logs

### Dashboard not showing data?
1. Wait 5-10 minutes for first data
2. Check browser console for errors
3. Verify DSN/App ID are correct
4. Make sure website is deployed

### Alerts not triggering?
1. Check alert rules configuration
2. Verify email addresses
3. Test with a deliberate error

---

## 💰 COST SUMMARY

| Service | Free Tier Limit | Cost if Exceeded |
|---------|-----------------|------------------|
| Sentry | 5,000 errors/month | $26/month |
| LogRocket | 1,000 sessions/month | $99/month |
| UptimeRobot | 50 monitors | $7/month |
| Apps Script | Unlimited | FREE |
| Google Analytics | Unlimited | FREE |

**Total for Khazaana: $0/month** (Free tiers sufficient)

---

*Last Updated: November 2025*
*For support: Check browser console errors or email helpkhazaana@gmail.com*
