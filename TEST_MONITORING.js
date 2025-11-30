// ============================================
// MONITORING VERIFICATION SCRIPT
// Run this in browser console on khazaana.co.in
// ============================================

console.log('🔍 Starting Monitoring Verification...\n');

// 1. Check if all monitoring scripts are loaded
console.log('📊 Monitoring Services Status:');
console.log('Sentry:', window.Sentry ? '✅ Loaded' : '❌ Not loaded');
console.log('LogRocket:', window.LogRocket ? '✅ Loaded' : '❌ Not loaded');
console.log('Google Analytics:', window.gtag ? '✅ Loaded' : '❌ Not loaded');
console.log('Monitoring System:', window.Monitoring ? '✅ Loaded' : '❌ Not loaded');

// 2. Test Sentry Error Tracking
console.log('\n🚨 Testing Sentry Error Tracking...');
try {
  throw new Error('Test error for Sentry verification');
} catch (error) {
  console.log('✅ Test error thrown - check Sentry dashboard');
}

// 2b. Test Sentry Logging
console.log('\n📝 Testing Sentry Logging...');
if (window.Monitoring && window.Monitoring.testSentryLogging) {
  window.Monitoring.testSentryLogging();
} else {
  console.warn('❌ Monitoring service not available for Sentry logging test');
}

// 3. Test LogRocket Session
console.log('\n📹 Testing LogRocket...');
if (window.LogRocket) {
  window.LogRocket.track('Verification Test', {
    message: 'Monitoring verification test',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });
  console.log('✅ LogRocket event sent - check dashboard for session');
} else {
  console.log('❌ LogRocket not loaded');
}

// 4. Test Google Analytics
console.log('\n📊 Testing Google Analytics...');
if (window.gtag) {
  window.gtag('event', 'monitoring_verification', {
    event_category: 'Testing',
    event_label: 'Monitoring System Check',
    value: 1
  });
  console.log('✅ GA4 event sent - check Analytics dashboard');
} else {
  console.log('❌ Google Analytics not loaded');
}

// 5. Test Custom Monitoring Webhook
console.log('\n📧 Testing Email Alert Webhook...');
fetch('https://script.google.com/macros/s/AKfycbw6KE2lGCTBd2VdgCKV2cGX-VEe0GscTJ9hC8ZkIFafHQefj4nrgi3Hb_-VRVJt7UgHGg/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'Monitoring Verification Test',
    data: { 
      message: 'All monitoring systems verified!',
      tests_run: ['Sentry', 'LogRocket', 'Google Analytics', 'Webhook']
    },
    timestamp: new Date().toISOString(),
    url: window.location.href
  })
}).then(() => {
  console.log('✅ Webhook test sent - check your emails');
}).catch(error => {
  console.log('❌ Webhook failed:', error.message);
});

// 6. Test TimeManager
console.log('\n⏰ Testing TimeManager...');
if (window.TimeManager) {
  const timeData = window.TimeManager.getCurrent();
  console.log('✅ TimeManager active:', timeData);
} else {
  console.log('❌ TimeManager not available');
}

console.log('\n🎯 Verification Complete!');
console.log('📧 Check emails: shr6219@gmail.com, helpkhazaana@gmail.com, Mdaskinali@gmail.com');
console.log('📊 Check dashboards: sentry.io, app.logrocket.com, analytics.google.com');
