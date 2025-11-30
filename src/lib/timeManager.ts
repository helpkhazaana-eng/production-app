/**
 * ============================================================
 * KHAZAANA TIME MANAGER
 * ============================================================
 * 
 * Efficiently manages all time-based features without hanging the browser.
 * Uses a single setInterval with requestAnimationFrame for smooth updates.
 * 
 * FEATURES:
 * - Single timer for all time-based operations
 * - Automatic cleanup on page unload
 * - Visibility API to pause when tab is hidden
 * - Debounced updates to prevent browser lag
 * - Production-optimized error handling
 */

// Timezone and configuration
const CONFIG = {
  TIMEZONE: 'Asia/Kolkata',
  IST_OFFSET: 5.5 * 60, // IST is UTC+5:30
  OPENS_AT: 9,  // 9 AM
  CLOSES_AT: 21, // 9 PM
  UPDATE_INTERVAL: 60000, // 1 minute
  DEBOUNCE_DELAY: 1000, // 1 second
};

// Cache for computed values
const cache = {
  lastUpdate: 0,
  isOpen: false,
  currentTime: '',
  countdown: '',
  lastISTHour: -1,
};

// Event listeners registry
const listeners = new Set<{
  id: string;
  callback: (data: TimeData) => void;
  priority: number;
}>();

// Main timer reference
let mainTimer: number | null = null;
let visibilityTimer: number | null = null;

// Time data interface
export interface TimeData {
  isOpen: boolean;
  currentTime: string;
  istTime: Date;
  istHour: number;
  istMinute: number;
  countdown: string;
  minutesUntilOpen: number;
  minutesUntilClose: number;
  isClosingSoon: boolean;
  isOpeningSoon: boolean;
}

// Get current IST time
function getISTTime(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (CONFIG.IST_OFFSET * 60000));
}

// Check if restaurant is open
function isRestaurantOpen(istHour: number): boolean {
  return istHour >= CONFIG.OPENS_AT && istHour < CONFIG.CLOSES_AT;
}

// Generate countdown text
function generateCountdown(istTime: Date, istHour: number): string {
  if (isRestaurantOpen(istHour)) {
    const closeTime = new Date(istTime);
    closeTime.setHours(CONFIG.CLOSES_AT, 0, 0, 0);
    const minutesUntilClose = Math.floor((closeTime.getTime() - istTime.getTime()) / (1000 * 60));
    
    if (minutesUntilClose <= 30) {
      const hours = Math.floor(minutesUntilClose / 60);
      const minutes = minutesUntilClose % 60;
      if (hours > 0) {
        return `Closes in ${hours}h ${minutes}m`;
      }
      return `Closes in ${minutes} minutes`;
    }
    return 'Open now';
  } else {
    const openTime = new Date(istTime);
    if (istHour < CONFIG.OPENS_AT) {
      openTime.setHours(CONFIG.OPENS_AT, 0, 0, 0);
    } else {
      openTime.setDate(openTime.getDate() + 1);
      openTime.setHours(CONFIG.OPENS_AT, 0, 0, 0);
    }
    
    const minutesUntilOpen = Math.floor((openTime.getTime() - istTime.getTime()) / (1000 * 60));
    const hours = Math.floor(minutesUntilOpen / 60);
    const minutes = minutesUntilOpen % 60;
    
    if (hours > 0) {
      return `Opens in ${hours}h ${minutes}m`;
    }
    return `Opens in ${minutes} minutes`;
  }
}

// Main time computation function
function computeTimeData(): TimeData {
  const istTime = getISTTime();
  const istHour = istTime.getHours();
  const istMinute = istTime.getMinutes();
  const isOpen = isRestaurantOpen(istHour);
  
  // Calculate minutes until open/close
  let minutesUntilOpen = 0;
  let minutesUntilClose = 0;
  
  if (isOpen) {
    const closeTime = new Date(istTime);
    closeTime.setHours(CONFIG.CLOSES_AT, 0, 0, 0);
    minutesUntilClose = Math.floor((closeTime.getTime() - istTime.getTime()) / (1000 * 60));
  } else {
    const openTime = new Date(istTime);
    if (istHour < CONFIG.OPENS_AT) {
      openTime.setHours(CONFIG.OPENS_AT, 0, 0, 0);
    } else {
      openTime.setDate(openTime.getDate() + 1);
      openTime.setHours(CONFIG.OPENS_AT, 0, 0, 0);
    }
    minutesUntilOpen = Math.floor((openTime.getTime() - istTime.getTime()) / (1000 * 60));
  }
  
  return {
    isOpen,
    currentTime: istTime.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    istTime,
    istHour,
    istMinute,
    countdown: generateCountdown(istTime, istHour),
    minutesUntilOpen,
    minutesUntilClose,
    isClosingSoon: isOpen && minutesUntilClose <= 30,
    isOpeningSoon: !isOpen && minutesUntilOpen <= 30,
  };
}

// Debounced update function
function debouncedUpdate() {
  const now = Date.now();
  if (now - cache.lastUpdate < CONFIG.DEBOUNCE_DELAY) {
    return;
  }
  
  try {
    const timeData = computeTimeData();
    
    // Only update if something changed
    if (cache.lastISTHour !== timeData.istHour || 
        cache.isOpen !== timeData.isOpen ||
        cache.countdown !== timeData.countdown) {
      
      // Update cache
      cache.lastUpdate = now;
      cache.lastISTHour = timeData.istHour;
      cache.isOpen = timeData.isOpen;
      cache.currentTime = timeData.currentTime;
      cache.countdown = timeData.countdown;
      
      // Notify all listeners using requestAnimationFrame
      requestAnimationFrame(() => {
        // Sort by priority
        const sortedListeners = Array.from(listeners).sort((a, b) => a.priority - b.priority);
        
        // Execute listeners with error handling
        for (const listener of sortedListeners) {
          try {
            listener.callback(timeData);
          } catch (error) {
            console.error(`TimeManager: Error in listener ${listener.id}:`, error);
            // Remove problematic listener
            listeners.delete(listener);
          }
        }
      });
    }
  } catch (error) {
    console.error('TimeManager: Error computing time data:', error);
  }
}

// Visibility change handler
function handleVisibilityChange() {
  if (document.hidden) {
    // Page is hidden, pause updates
    if (mainTimer) {
      clearInterval(mainTimer);
      mainTimer = null;
    }
  } else {
    // Page is visible, resume updates
    if (!mainTimer) {
      mainTimer = window.setInterval(debouncedUpdate, CONFIG.UPDATE_INTERVAL);
      // Update immediately
      debouncedUpdate();
    }
  }
}

// Initialize TimeManager
export function initTimeManager() {
  // Clean up any existing timer
  if (mainTimer) {
    clearInterval(mainTimer);
    mainTimer = null;
  }
  
  // Set up visibility API
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Start main timer
  mainTimer = window.setInterval(debouncedUpdate, CONFIG.UPDATE_INTERVAL);
  
  // Initial update
  debouncedUpdate();
  
  console.log('TimeManager initialized');
}

// Add time update listener
export function addTimeListener(id: string, callback: (data: TimeData) => void, priority: number = 10) {
  listeners.add({ id, callback, priority });
  
  // Immediately call with current data
  try {
    callback(computeTimeData());
  } catch (error) {
    console.error(`TimeManager: Error in initial call for listener ${id}:`, error);
  }
}

// Remove time listener
export function removeTimeListener(id: string) {
  for (const listener of listeners) {
    if (listener.id === id) {
      listeners.delete(listener);
      break;
    }
  }
}

// Get current time data (synchronous)
export function getCurrentTimeData(): TimeData {
  return computeTimeData();
}

// Check if ordering is open now
export function isOrderingOpenNow(): boolean {
  return isRestaurantOpen(getISTTime().getHours());
}

// Cleanup function
export function cleanupTimeManager() {
  if (mainTimer) {
    clearInterval(mainTimer);
    mainTimer = null;
  }
  
  if (visibilityTimer) {
    clearTimeout(visibilityTimer);
    visibilityTimer = null;
  }
  
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  listeners.clear();
  
  console.log('TimeManager cleaned up');
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupTimeManager);
  window.addEventListener('unload', cleanupTimeManager);
}

// Export utilities
export const TimeUtils = {
  getISTTime,
  isRestaurantOpen,
  generateCountdown,
  getCurrentTimeData,
  isOrderingOpenNow,
};

export default {
  init: initTimeManager,
  addListener: addTimeListener,
  removeListener: removeTimeListener,
  getCurrent: getCurrentTimeData,
  cleanup: cleanupTimeManager,
  utils: TimeUtils,
};
