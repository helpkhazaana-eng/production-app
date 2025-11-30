# 🚀 DEPLOY GOOGLE APPS SCRIPT - COMPLETE INSTRUCTIONS

## ⚠️ CRITICAL: You MUST Deploy as NEW Web App

The updated script in `GOOGLE_APPS_SCRIPT_CORS_FIXED.js` now includes:
- ✅ `doOptions()` handler for CORS preflight
- ✅ Proper CORS headers on all responses
- ✅ Support for GET (image beacon) and POST requests

## 📋 Step-by-Step Deployment

### 1. Open Google Apps Script
1. Go to: https://script.google.com
2. Open your existing "Khazaana Monitoring Webhook" project
   OR create a new project

### 2. Copy the Updated Code
1. Open `GOOGLE_APPS_SCRIPT_CORS_FIXED.js` from this folder
2. Select ALL code (Cmd+A / Ctrl+A)
3. Copy it (Cmd+C / Ctrl+C)

### 3. Paste into Apps Script Editor
1. In Apps Script editor, select all existing code
2. Delete it
3. Paste the new code from `GOOGLE_APPS_SCRIPT_CORS_FIXED.js`
4. Click **Save** (💾 icon)

### 4. Deploy as NEW Web App (CRITICAL!)
1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Configure:
   - **Description**: "Khazaana Monitoring v4 - CORS Fixed"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (MUST be "Anyone", not "Anyone with link")
4. Click **Deploy**
5. **Authorize** the script (if prompted)
6. **COPY THE NEW WEB APP URL** (looks like: `https://script.google.com/macros/s/AKfycb...`)

### 5. Update Frontend with New URL
Once you have the new URL, update `src/layouts/BaseLayout.astro`:

Find this line:
```javascript
img.src = 'https://script.google.com/macros/s/AKfycbw6KE2lGCTBd2VdgCKV2cGX-VEe0GscTJ9hC8ZkIFafHQefj4nrgi3Hb_-VRVJt7UgHGg/exec?data=' + ...
```

Replace with your NEW URL.

## 🧪 Test the Deployment

### Test 1: OPTIONS Request (CORS Preflight)
Open browser console on any page and run:
```javascript
fetch("YOUR_NEW_GAS_URL", { method: "OPTIONS" })
  .then(r => console.log("✅ OPTIONS works:", r.status))
  .catch(e => console.error("❌ OPTIONS failed:", e));
```

**Expected**: `✅ OPTIONS works: 200`

### Test 2: GET Request (Image Beacon)
```javascript
var img = new Image();
img.src = "YOUR_NEW_GAS_URL?data=" + encodeURIComponent(JSON.stringify({
  subject: "Test",
  data: { message: "Testing GET" }
}));
img.onload = () => console.log("✅ GET works");
img.onerror = () => console.log("✅ GET sent (image error is normal)");
```

**Expected**: Email received at all 3 addresses

### Test 3: POST Request
```javascript
fetch("YOUR_NEW_GAS_URL", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    subject: "Test POST",
    data: { message: "Testing POST with CORS" }
  })
})
.then(r => r.json())
.then(d => console.log("✅ POST works:", d))
.catch(e => console.error("❌ POST failed:", e));
```

**Expected**: `✅ POST works: {success: true, ...}`

## ✅ Success Checklist

- [ ] Copied code from `GOOGLE_APPS_SCRIPT_CORS_FIXED.js`
- [ ] Deployed as **NEW** Web App (not updated existing)
- [ ] Set "Who has access" to **Anyone**
- [ ] Copied new deployment URL
- [ ] OPTIONS test passes (200 status)
- [ ] GET test sends email
- [ ] POST test returns success
- [ ] No CORS errors in browser console

## 🔧 Troubleshooting

### Still Getting CORS Errors?
1. Make sure you deployed as **NEW** deployment (not updated old one)
2. Verify "Who has access" is set to **Anyone** (not "Anyone with link")
3. Clear browser cache and hard reload (Cmd+Shift+R / Ctrl+Shift+F5)
4. Check that service worker is updated (see Application tab in DevTools)

### Emails Not Arriving?
1. Check Gmail spam folder
2. Verify email addresses in CONFIG object
3. Check Apps Script execution logs: View → Executions

### Service Worker Issues?
1. Open DevTools → Application → Service Workers
2. Click "Unregister" on old service worker
3. Hard reload page (Cmd+Shift+R / Ctrl+Shift+F5)
4. New service worker should register with bypass logic

## 📧 Email Configuration

The script sends emails to these addresses (configured in CONFIG):
- shr6219@gmail.com
- helpkhazaana@gmail.com
- Mdaskinali@gmail.com

To change recipients, edit the `ALERT_EMAILS` array in the Apps Script.

## 🎯 What Changed?

### Added `doOptions()` Function
Handles CORS preflight requests that browsers send before POST requests.

### Updated All Response Headers
Every response now includes:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET,POST,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

### Service Worker Bypass
Service worker now skips Google Apps Script requests to prevent interference.

---

**Once deployed, provide the new URL and I'll update the frontend!** 🚀
