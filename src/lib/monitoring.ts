/**
 * ============================================================
 * KHAZAANA MONITORING, LOGGING & ALERTING SYSTEM
 * ============================================================
 * 
 * This module provides comprehensive monitoring for the Khazaana
 * food ordering platform with multiple fallback services.
 * 
 * SERVICES USED (All Free Tiers Available):
 * 1. Sentry - Error tracking & performance monitoring
 * 2. LogRocket - Session replay & user journey
 * 3. Uptime Robot - Uptime monitoring with email alerts
 * 4. Google Apps Script - Custom alerts to email
 * 5. Vercel Analytics - Already integrated
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create accounts on each service (free tier)
 * 2. Replace placeholder IDs below
 * 3. Configure email alerts in each dashboard
 */

// ============================================================
// CONFIGURATION
// ============================================================
export const MONITORING_CONFIG = {
  // Sentry (https://sentry.io) - Error Tracking
  SENTRY_DSN: process.env.PUBLIC_SENTRY_DSN || 'https://8eeb5a726529801ef43ed298c7b3a0b6@o4510453631156224.ingest.us.sentry.io/4510453644001280', // Khazaana project
  
  // LogRocket (https://logrocket.com) - Session Replay
  LOGROCKET_APP_ID: process.env.PUBLIC_LOGROCKET_APP_ID || 'khazaana/khazaana-web', // From screenshot
  
  // Custom Alert Webhook (Google Apps Script)
  ALERT_WEBHOOK_URL: process.env.PUBLIC_ALERT_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbzyXjUTAP7JcLf_L4A-zKvTkKOHaaUbB4MAB_ukpvZhW6AQxNc8ZzFgXj2zrfmnslBOTw/exec', // Khazaana Alert System
  
  // Alert Emails (comma-separated for multiple recipients)
  ALERT_EMAILS: [
    'shr6219@gmail.com',
    'helpkhazaana@gmail.com',
    'Mdaskinali@gmail.com'
  ],
  
  // Primary Alert Email
  PRIMARY_EMAIL: 'helpkhazaana@gmail.com',
  
  // Environment
  ENVIRONMENT: 'production',
  
  // App Version
  APP_VERSION: '1.0.0',
  
  // Daily Report Time (24-hour format)
  DAILY_REPORT_HOUR: 21 // 9 PM IST
};

// ============================================================
// ERROR SEVERITY LEVELS
// ============================================================
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================
// LOG TYPES
// ============================================================
export enum LogType {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
  PERFORMANCE = 'performance',
  USER_ACTION = 'user_action',
  ORDER = 'order',
  PAYMENT = 'payment'
}

// ============================================================
// MONITORING CLASS
// ============================================================
class MonitoringService {
  private isInitialized = false;
  private errorQueue: any[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize all monitoring services
  async init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      // Initialize Sentry
      await this.initSentry();
      
      // Initialize LogRocket
      await this.initLogRocket();
      
      // Set up global error handlers
      this.setupGlobalErrorHandlers();
      
      // Set up performance monitoring
      this.setupPerformanceMonitoring();
      
      // Process queued errors
      this.processErrorQueue();
      
      this.isInitialized = true;
      this.log(LogType.INFO, 'Monitoring initialized', { sessionId: this.sessionId });
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
    }
  }

  // Initialize Sentry
  private async initSentry() {
    if (MONITORING_CONFIG.SENTRY_DSN === 'YOUR_SENTRY_DSN') return;

    try {
      // Dynamically load Sentry
      const script = document.createElement('script');
      script.src = 'https://browser.sentry-cdn.com/7.91.0/bundle.min.js';
      script.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // @ts-ignore
      if (window.Sentry) {
        // @ts-ignore
        window.Sentry.init({
          dsn: MONITORING_CONFIG.SENTRY_DSN,
          environment: MONITORING_CONFIG.ENVIRONMENT,
          release: `khazaana@${MONITORING_CONFIG.APP_VERSION}`,
          tracesSampleRate: 0.2,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        });
      }
    } catch (error) {
      console.warn('Sentry initialization failed:', error);
    }
  }

  // Initialize LogRocket
  private async initLogRocket() {
    if (MONITORING_CONFIG.LOGROCKET_APP_ID === 'YOUR_LOGROCKET_APP_ID') return;

    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.lr-ingest.io/LogRocket.min.js';
      script.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // @ts-ignore
      if (window.LogRocket) {
        // @ts-ignore
        window.LogRocket.init(MONITORING_CONFIG.LOGROCKET_APP_ID);
      }
    } catch (error) {
      console.warn('LogRocket initialization failed:', error);
    }
  }

  // Set up global error handlers
  private setupGlobalErrorHandlers() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        type: 'unhandled_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason || new Error('Unhandled Promise Rejection'), {
        type: 'unhandled_rejection'
      });
    });

    // Catch fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        // Log slow requests
        if (duration > 3000) {
          this.log(LogType.PERFORMANCE, 'Slow API request', {
            url: args[0],
            duration: Math.round(duration),
            status: response.status
          });
        }
        
        // Log failed requests
        if (!response.ok) {
          this.log(LogType.WARNING, 'API request failed', {
            url: args[0],
            status: response.status,
            statusText: response.statusText
          });
        }
        
        return response;
      } catch (error) {
        this.captureError(error as Error, {
          type: 'fetch_error',
          url: args[0]
        });
        throw error;
      }
    };
  }

  // Set up performance monitoring
  private setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.log(LogType.PERFORMANCE, 'LCP', {
            value: Math.round(lastEntry.startTime),
            rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor'
          });
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.log(LogType.PERFORMANCE, 'FID', {
              value: Math.round(entry.processingStart - entry.startTime),
              rating: entry.processingStart - entry.startTime < 100 ? 'good' : 'poor'
            });
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {}

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        
        // Report CLS on page hide
        window.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            this.log(LogType.PERFORMANCE, 'CLS', {
              value: clsValue.toFixed(4),
              rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
            });
          }
        });
      } catch (e) {}
    }

    // Page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        
        this.log(LogType.PERFORMANCE, 'Page Load', {
          pageLoadTime: Math.round(pageLoadTime),
          domContentLoaded: Math.round(domContentLoaded),
          dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
          tcpConnect: timing.connectEnd - timing.connectStart,
          serverResponse: timing.responseEnd - timing.requestStart
        });
      }, 0);
    });
  }

  // Process queued errors
  private processErrorQueue() {
    while (this.errorQueue.length > 0) {
      const { error, context } = this.errorQueue.shift();
      this.captureError(error, context);
    }
  }

  // Capture and report error
  captureError(error: Error, context?: Record<string, any>, severity: ErrorSeverity = ErrorSeverity.MEDIUM) {
    if (!this.isInitialized) {
      this.errorQueue.push({ error, context });
      return;
    }

    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      severity,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Log to console
    console.error('[Khazaana Error]', errorData);

    // Send to Sentry
    // @ts-ignore
    if (window.Sentry) {
      // @ts-ignore
      window.Sentry.captureException(error, { extra: context });
    }

    // Send to LogRocket
    // @ts-ignore
    if (window.LogRocket) {
      // @ts-ignore
      window.LogRocket.captureException(error, { extra: context });
    }

    // Send critical errors to webhook
    if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
      this.sendAlert('Error Alert', errorData);
    }

    // Track in GA4
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: severity === ErrorSeverity.CRITICAL
      });
    }
  }

  // General logging
  log(type: LogType, message: string, data?: Record<string, any>) {
    const logData = {
      type,
      message,
      data,
      sessionId: this.sessionId,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Console log based on type
    switch (type) {
      case LogType.ERROR:
        console.error('[Khazaana]', message, data);
        break;
      case LogType.WARNING:
        console.warn('[Khazaana]', message, data);
        break;
      case LogType.DEBUG:
        console.debug('[Khazaana]', message, data);
        break;
      default:
        console.log('[Khazaana]', message, data);
    }

    // Send to LogRocket
    // @ts-ignore
    if (window.LogRocket) {
      // @ts-ignore
      window.LogRocket.log(message, logData);
    }

    // Track important events in GA4
    if (type === LogType.ORDER || type === LogType.PAYMENT || type === LogType.ERROR) {
      if (window.gtag) {
        window.gtag('event', `log_${type}`, {
          event_category: 'Logging',
          event_label: message,
          ...data
        });
      }
    }
  }

  // Send alert via webhook
  async sendAlert(subject: string, data: any) {
    if (MONITORING_CONFIG.ALERT_WEBHOOK_URL === 'YOUR_APPS_SCRIPT_WEBHOOK_URL') {
      console.warn('Alert webhook not configured');
      return;
    }

    try {
      await fetch(MONITORING_CONFIG.ALERT_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          data,
          timestamp: new Date().toISOString(),
          url: window.location.href
        })
      });
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  // Track user action
  trackUserAction(action: string, details?: Record<string, any>) {
    this.log(LogType.USER_ACTION, action, details);
    
    // @ts-ignore
    if (window.LogRocket) {
      // @ts-ignore
      window.LogRocket.track(action, details);
    }

    if (window.gtag) {
      window.gtag('event', action, {
        event_category: 'User Action',
        ...details
      });
    }
  }

  // Track order
  trackOrder(orderId: string, details: Record<string, any>) {
    this.log(LogType.ORDER, `Order ${orderId}`, details);
    this.sendAlert('New Order', { orderId, ...details });
  }

  // Identify user
  identifyUser(userId: string, traits?: Record<string, any>) {
    // @ts-ignore
    if (window.LogRocket) {
      // @ts-ignore
      window.LogRocket.identify(userId, traits);
    }

    // @ts-ignore
    if (window.Sentry) {
      // @ts-ignore
      window.Sentry.setUser({ id: userId, ...traits });
    }

    if (window.gtag) {
      window.gtag('config', 'G-VSLCVT356G', {
        user_id: userId
      });
    }
  }

  // Get session ID
  getSessionId(): string {
    return this.sessionId;
  }
}

// Export singleton instance
export const Monitoring = new MonitoringService();

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    Monitoring.init();
  });
}

export default Monitoring;
