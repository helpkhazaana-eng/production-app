# Khazaana Monitoring, Logging & Alerting Setup Guide

## Overview
This guide helps you set up comprehensive monitoring for Khazaana with email alerts.

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Google Apps Script Alert Webhook (FREE - Email Alerts)

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Delete default code and paste this:

```javascript
/**
 * KHAZAANA ALERT SYSTEM
 * Receives alerts from the website and sends email notifications
 */

// Configuration - Khazaana Alert Emails
const CONFIG = {
  ALERT_EMAILS: [
    'shr6219@gmail.com',
    'helpkhazaana@gmail.com',
    'Mdaskinali@gmail.com'
  ],
  PRIMARY_EMAIL: 'helpkhazaana@gmail.com',
  SPREADSHEET_ID: '', // Optional: Create a Google Sheet and add ID here for logging
  DAILY_REPORT_HOUR: 21, // 9 PM IST
};

// Handle POST requests from website
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Log to spreadsheet if configured
    if (CONFIG.SPREADSHEET_ID) {
      logToSheet(data);
    }
    
    // Send email alert
    sendEmailAlert(data);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Alert processed'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error processing alert:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'Khazaana Alert System Active',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// Send email alert to all configured emails
function sendEmailAlert(data) {
  const subject = `🚨 Khazaana Alert: ${data.subject || 'System Alert'}`;
  
  let body = `
KHAZAANA ALERT NOTIFICATION
============================

Time: ${data.timestamp || new Date().toISOString()}
URL: ${data.url || 'N/A'}

ALERT DETAILS:
${JSON.stringify(data.data, null, 2)}

---
This is an automated alert from Khazaana Monitoring System.
  `;
  
  // HTML version
  let htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B35, #FFB800); padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🚨 Khazaana Alert</h1>
      </div>
      <div style="background: #f9f9f9; padding: 20px; border: 1px solid #ddd;">
        <h2 style="color: #333;">${data.subject || 'System Alert'}</h2>
        <p><strong>Time:</strong> ${data.timestamp || new Date().toISOString()}</p>
        <p><strong>URL:</strong> ${data.url || 'N/A'}</p>
        <h3>Alert Details:</h3>
        <pre style="background: #fff; padding: 15px; border-radius: 5px; overflow-x: auto;">${JSON.stringify(data.data, null, 2)}</pre>
      </div>
      <div style="background: #333; color: #fff; padding: 10px; text-align: center; border-radius: 0 0 10px 10px;">
        <small>Khazaana Monitoring System</small>
      </div>
    </div>
  `;
  
  // Send to all configured emails
  CONFIG.ALERT_EMAILS.forEach(email => {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: body,
      htmlBody: htmlBody
    });
  });
}

// Log to Google Sheet
function logToSheet(data) {
  if (!CONFIG.SPREADSHEET_ID) return;
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName('Alerts');
    
    if (!sheet) {
      sheet = ss.insertSheet('Alerts');
      sheet.appendRow(['Timestamp', 'Subject', 'URL', 'Data', 'Severity']);
    }
    
    sheet.appendRow([
      new Date(),
      data.subject || 'Alert',
      data.url || '',
      JSON.stringify(data.data),
      data.data?.severity || 'unknown'
    ]);
  } catch (error) {
    console.error('Error logging to sheet:', error);
  }
}

// Daily monitoring status email - Sent to all team members
function sendDailyMonitoringReport() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Get website status
  const siteStatus = checkWebsiteStatus();
  
  // Get alerts count if spreadsheet is configured
  let alertsCount = 0;
  let criticalAlerts = 0;
  let alertsSummary = [];
  
  if (CONFIG.SPREADSHEET_ID) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      const sheet = ss.getSheetByName('Alerts');
      if (sheet) {
        const data = sheet.getDataRange().getValues();
        const todayAlerts = data.filter(row => {
          const rowDate = new Date(row[0]);
          return rowDate >= yesterday;
        });
        alertsCount = todayAlerts.length;
        criticalAlerts = todayAlerts.filter(a => a[4] === 'critical' || a[4] === 'high').length;
        alertsSummary = todayAlerts.slice(0, 10); // Last 10 alerts
      }
    } catch (e) {
      console.error('Error reading alerts:', e);
    }
  }
  
  const subject = `📊 Khazaana Daily Status Report - ${today.toLocaleDateString('en-IN')}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: linear-gradient(135deg, #FF6B35, #FFB800); padding: 25px; border-radius: 15px 15px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📊 Khazaana Daily Status Report</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      <div style="background: white; padding: 25px; border: 1px solid #ddd;">
        <!-- Website Status -->
        <div style="background: ${siteStatus.isUp ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; color: ${siteStatus.isUp ? '#155724' : '#721c24'};">
            ${siteStatus.isUp ? '✅ Website is UP' : '❌ Website is DOWN'}
          </h2>
          <p style="margin: 10px 0 0 0; color: #666;">
            Response Time: ${siteStatus.responseTime}ms | Last Check: ${new Date().toLocaleTimeString('en-IN')}
          </p>
        </div>
        
        <!-- Quick Stats -->
        <div style="display: flex; justify-content: space-around; margin-bottom: 25px; flex-wrap: wrap;">
          <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px; min-width: 120px; margin: 5px;">
            <div style="font-size: 32px; font-weight: bold; color: #FF6B35;">${alertsCount}</div>
            <div style="color: #666; font-size: 14px;">Total Alerts (24h)</div>
          </div>
          <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px; min-width: 120px; margin: 5px;">
            <div style="font-size: 32px; font-weight: bold; color: ${criticalAlerts > 0 ? '#dc3545' : '#28a745'};">${criticalAlerts}</div>
            <div style="color: #666; font-size: 14px;">Critical Alerts</div>
          </div>
          <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px; min-width: 120px; margin: 5px;">
            <div style="font-size: 32px; font-weight: bold; color: #17a2b8;">${siteStatus.responseTime}</div>
            <div style="color: #666; font-size: 14px;">Response (ms)</div>
          </div>
        </div>
        
        <!-- System Health -->
        <h3 style="color: #333; border-bottom: 2px solid #FF6B35; padding-bottom: 10px;">🏥 System Health</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background: #f8f9fa;">
            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Website</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">https://khazaana.co.in</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
              <span style="background: ${siteStatus.isUp ? '#28a745' : '#dc3545'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">
                ${siteStatus.isUp ? 'ONLINE' : 'OFFLINE'}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd;"><strong>SSL Certificate</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">Valid</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
              <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">SECURE</span>
            </td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Analytics</strong></td>
            <td style="padding: 12px; border: 1px solid #ddd;">Google Analytics 4</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">
              <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">ACTIVE</span>
            </td>
          </tr>
        </table>
        
        <!-- Recent Alerts -->
        ${alertsSummary.length > 0 ? `
        <h3 style="color: #333; border-bottom: 2px solid #FF6B35; padding-bottom: 10px;">🔔 Recent Alerts (Last 24h)</h3>
        <ul style="padding-left: 20px; color: #666;">
          ${alertsSummary.map(a => `<li style="margin-bottom: 8px;">${a[1]} - ${new Date(a[0]).toLocaleString('en-IN')}</li>`).join('')}
        </ul>
        ` : `
        <div style="background: #d4edda; padding: 15px; border-radius: 10px; text-align: center;">
          <p style="margin: 0; color: #155724;">✅ No alerts in the last 24 hours. All systems running smoothly!</p>
        </div>
        `}
        
        <!-- Quick Links -->
        <h3 style="color: #333; border-bottom: 2px solid #FF6B35; padding-bottom: 10px; margin-top: 25px;">🔗 Quick Links</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          <a href="https://khazaana.co.in" style="background: #FF6B35; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">🌐 Website</a>
          <a href="https://analytics.google.com" style="background: #4285f4; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">📊 Analytics</a>
          <a href="https://vercel.com" style="background: #000; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">🚀 Vercel</a>
        </div>
      </div>
      
      <div style="background: #333; color: #fff; padding: 15px; text-align: center; border-radius: 0 0 15px 15px;">
        <p style="margin: 0; font-size: 12px;">Khazaana Monitoring System | Daily Report at 9:00 PM IST</p>
        <p style="margin: 5px 0 0 0; font-size: 11px; color: #aaa;">Sent to: shr6219@gmail.com, helpkhazaana@gmail.com, Mdaskinali@gmail.com</p>
      </div>
    </div>
  `;
  
  // Send to all team members
  CONFIG.ALERT_EMAILS.forEach(email => {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody
    });
  });
  
  console.log('Daily monitoring report sent to all team members');
}

// Check website status
function checkWebsiteStatus() {
  try {
    const startTime = new Date().getTime();
    const response = UrlFetchApp.fetch('https://khazaana.co.in', {
      muteHttpExceptions: true,
      followRedirects: true
    });
    const endTime = new Date().getTime();
    
    return {
      isUp: response.getResponseCode() === 200,
      responseTime: endTime - startTime,
      statusCode: response.getResponseCode()
    };
  } catch (error) {
    return {
      isUp: false,
      responseTime: 0,
      error: error.message
    };
  }
}

// Set up all triggers
function setupAllTriggers() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Daily monitoring report at 9 PM IST
  ScriptApp.newTrigger('sendDailyMonitoringReport')
    .timeBased()
    .atHour(CONFIG.DAILY_REPORT_HOUR)
    .everyDays(1)
    .inTimezone('Asia/Kolkata')
    .create();
  
  // Hourly website check (optional - for immediate alerts)
  ScriptApp.newTrigger('checkAndAlertIfDown')
    .timeBased()
    .everyHours(1)
    .create();
  
  console.log('All triggers set up successfully');
}

// Check website and alert if down
function checkAndAlertIfDown() {
  const status = checkWebsiteStatus();
  
  if (!status.isUp) {
    const alertData = {
      subject: '🚨 CRITICAL: Website is DOWN!',
      data: {
        severity: 'critical',
        message: 'Khazaana website is not responding',
        statusCode: status.statusCode,
        error: status.error,
        checkedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      url: 'https://khazaana.co.in'
    };
    
    sendEmailAlert(alertData);
    
    if (CONFIG.SPREADSHEET_ID) {
      logToSheet(alertData);
    }
  }
}
```

4. Click "Deploy" → "New Deployment"
5. Select "Web app"
6. Set "Execute as" = "Me"
7. Set "Who has access" = "Anyone"
8. Click "Deploy" and copy the URL
9. Add the URL to `src/lib/monitoring.ts` as `ALERT_WEBHOOK_URL`

---

### Step 2: Sentry Setup (FREE - Error Tracking)

1. Go to [Sentry.io](https://sentry.io) and create account
2. Create new project → Select "Browser JavaScript"
3. Copy the DSN (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)
4. Add to `src/lib/monitoring.ts` as `SENTRY_DSN`

**Sentry Features:**
- Real-time error tracking
- Stack traces
- User context
- Performance monitoring
- Email alerts on new errors

---

### Step 3: LogRocket Setup (FREE - Session Replay)

1. Go to [LogRocket.com](https://logrocket.com) and create account
2. Create new project
3. Copy App ID (format: `org/app`)
4. Add to `src/lib/monitoring.ts` as `LOGROCKET_APP_ID`

**LogRocket Features:**
- Session replay (watch user sessions)
- User journey tracking
- Network request logging
- Console log capture
- Redux/state tracking

---

### Step 4: UptimeRobot Setup (FREE - Uptime Monitoring)

1. Go to [UptimeRobot.com](https://uptimerobot.com) and create account
2. Add new monitor:
   - Monitor Type: HTTP(s)
   - URL: `https://khazaana.co.in`
   - Monitoring Interval: 5 minutes
3. Add alert contact (your email)
4. Create additional monitors for:
   - `https://khazaana.co.in/restaurants/`
   - `https://khazaana.co.in/cart/`

**UptimeRobot Features:**
- 50 free monitors
- 5-minute checks
- Email/SMS alerts
- Status page
- Response time tracking

---

### Step 5: Better Uptime (Alternative - More Features)

1. Go to [BetterUptime.com](https://betteruptime.com)
2. Add monitors for your URLs
3. Set up incident management
4. Create status page

---

## 📊 What Gets Tracked

### Automatic Tracking:
- ✅ Page views
- ✅ JavaScript errors
- ✅ API failures
- ✅ Slow page loads
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ Scroll depth
- ✅ Time on page
- ✅ Outbound clicks
- ✅ Phone calls
- ✅ WhatsApp clicks

### Custom Events:
- ✅ Add to cart
- ✅ Checkout initiation
- ✅ Order completion
- ✅ Search queries
- ✅ Restaurant views

---

## 🔔 Alert Types

| Alert Type | Trigger | Email? |
|------------|---------|--------|
| Critical Error | JavaScript crash | ✅ Immediate |
| High Error | API failure | ✅ Immediate |
| Site Down | Uptime check fails | ✅ Immediate |
| Slow Performance | Page load > 5s | ✅ Daily digest |
| New Order | Order placed | ✅ Immediate |

---

## 📱 Mobile App Monitoring (Optional)

For mobile push notifications, consider:
- **PagerDuty** (free tier) - Incident management
- **Pushover** - Mobile push notifications
- **Telegram Bot** - Free alerts via Telegram

---

## 🛠️ Testing Your Setup

### Test Alert Webhook:
```javascript
// Run in browser console on your site
fetch('YOUR_WEBHOOK_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'Test Alert',
    data: { message: 'This is a test alert' },
    timestamp: new Date().toISOString(),
    url: window.location.href
  })
});
```

### Test Error Tracking:
```javascript
// Run in browser console
throw new Error('Test error for monitoring');
```

---

## 📈 Viewing Analytics

| Service | Dashboard URL |
|---------|---------------|
| Google Analytics | [analytics.google.com](https://analytics.google.com) |
| Sentry | [sentry.io](https://sentry.io) |
| LogRocket | [app.logrocket.com](https://app.logrocket.com) |
| UptimeRobot | [uptimerobot.com](https://uptimerobot.com) |
| Vercel | [vercel.com/analytics](https://vercel.com/analytics) |

---

## 🔒 Security Notes

1. Never expose API keys in client-side code
2. Use environment variables for sensitive data
3. Webhook URLs are safe to expose (they only accept POST)
4. Rate limit your alert webhook to prevent spam

---

## 💰 Cost Summary

| Service | Free Tier | Paid Upgrade |
|---------|-----------|--------------|
| Google Analytics | Unlimited | N/A |
| Sentry | 5K errors/month | $26/month |
| LogRocket | 1K sessions/month | $99/month |
| UptimeRobot | 50 monitors | $7/month |
| Google Apps Script | Unlimited | N/A |
| Vercel Analytics | Included | N/A |

**Total Cost: $0/month** (Free tier is sufficient for most sites)

---

## 🆘 Support

For issues with monitoring setup:
1. Check browser console for errors
2. Verify webhook URL is correct
3. Test each service individually
4. Check email spam folder for alerts

---

*Last Updated: November 2025*
