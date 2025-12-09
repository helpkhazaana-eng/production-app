import type { Restaurant } from '../types';

// Centralized timing configuration
export const RESTAURANT_TIMINGS = {
  opensAt: '09:00',
  closesAt: '21:00',
  timezone: 'Asia/Kolkata'
};

// Centralized contact information
export const KHAZAANA_CONTACT = {
  phone: '8695902696',           // Primary number for orders, calls
  phoneBackup: '8649851034',     // Backup number
  whatsapp: '8695902696',        // Primary WhatsApp for orders
  whatsappCheckout: '8695902696' // Production number for checkout
};

// Centralized pricing
export const RESTAURANT_PRICING = {
  costForTwo: 200 // in rupees
};

// Cups N Crumbs is prioritized first in the list
export const restaurants: Restaurant[] = [
  {
    id: 'cupsncrumbs',
    name: 'Cups N Crumbs',
    address: 'College More, near DNC College, Aurangabad, Suti, West Bengal 742201',
    phone: KHAZAANA_CONTACT.phone,
    whatsapp: KHAZAANA_CONTACT.whatsapp,
    opensAt: RESTAURANT_TIMINGS.opensAt,
    closesAt: RESTAURANT_TIMINGS.closesAt,
    status: 'open',
    category: 'Cafe',
    featured: true,
    rating: 4.4,
    cuisine: ['Cafe', 'Bakery'],
    priceRange: '₹₹',
    costForTwo: RESTAURANT_PRICING.costForTwo,
    menuFile: 'cupsncrumbs.csv'
  },
  {
    id: 'khazaanarasoi',
    name: 'Khazaana Rasoi - Ghorer Moto Ranna',
    address: 'College More, near DNC College, Aurangabad, Suti, West Bengal 742201',
    phone: KHAZAANA_CONTACT.phone,
    whatsapp: KHAZAANA_CONTACT.whatsapp,
    opensAt: RESTAURANT_TIMINGS.opensAt,
    closesAt: RESTAURANT_TIMINGS.closesAt,
    status: 'open',
    category: 'Indian',
    featured: false,
    rating: 4.5,
    cuisine: ['Indian', 'Bengali'],
    priceRange: '₹₹',
    costForTwo: RESTAURANT_PRICING.costForTwo,
    menuFile: 'khazaanarasoi.csv'
  },
  {
    id: 'aaviora',
    name: 'Aaviora',
    address: 'College More, near DNC College, Aurangabad, Suti, West Bengal 742201',
    phone: KHAZAANA_CONTACT.phone,
    whatsapp: KHAZAANA_CONTACT.whatsapp,
    opensAt: RESTAURANT_TIMINGS.opensAt,
    closesAt: RESTAURANT_TIMINGS.closesAt,
    status: 'open',
    category: 'Chinese',
    featured: false,
    rating: 4.5,
    cuisine: ['Chinese', 'Asian'],
    priceRange: '₹₹',
    costForTwo: RESTAURANT_PRICING.costForTwo,
    menuFile: 'aaviora.csv'
  },
  {
    id: 'arsalan',
    name: 'Kolkata Arsalan Biryani',
    address: 'College More, near DNC College, Aurangabad, Suti, West Bengal 742201',
    phone: KHAZAANA_CONTACT.phone,
    whatsapp: KHAZAANA_CONTACT.whatsapp,
    opensAt: RESTAURANT_TIMINGS.opensAt,
    closesAt: RESTAURANT_TIMINGS.closesAt,
    status: 'open',
    category: 'Biryani',
    featured: false,
    rating: 4.7,
    cuisine: ['Biryani', 'Mughlai'],
    priceRange: '₹₹₹',
    costForTwo: RESTAURANT_PRICING.costForTwo,
    menuFile: 'arsalan.csv'
  },
  {
    id: 'bandhu-hotel',
    name: 'Bandhu Hotel',
    address: 'College More, near DNC College, Aurangabad, Suti, West Bengal 742201',
    phone: KHAZAANA_CONTACT.phone,
    whatsapp: KHAZAANA_CONTACT.whatsapp,
    opensAt: RESTAURANT_TIMINGS.opensAt,
    closesAt: RESTAURANT_TIMINGS.closesAt,
    status: 'open',
    category: 'Indian',
    featured: false,
    rating: 4.2,
    cuisine: ['Indian', 'Bengali'],
    priceRange: '₹₹',
    costForTwo: RESTAURANT_PRICING.costForTwo,
    menuFile: 'bandhu-hotel.csv'
  },
  {
    id: 'bholebaba',
    name: 'Bhole Baba Roll Corner',
    address: 'College More, near DNC College, Aurangabad, Suti, West Bengal 742201',
    phone: KHAZAANA_CONTACT.phone,
    whatsapp: KHAZAANA_CONTACT.whatsapp,
    opensAt: RESTAURANT_TIMINGS.opensAt,
    closesAt: RESTAURANT_TIMINGS.closesAt,
    status: 'open',
    category: 'Street Food',
    featured: false,
    rating: 4.0,
    cuisine: ['Street Food', 'Snacks'],
    priceRange: '₹',
    costForTwo: RESTAURANT_PRICING.costForTwo,
    menuFile: 'bholebaba.csv'
  },
  {
    id: 'whitechocolate',
    name: 'White Chocolate The Cake House',
    address: 'College More, near DNC College, Aurangabad, Suti, West Bengal 742201',
    phone: KHAZAANA_CONTACT.phone,
    whatsapp: KHAZAANA_CONTACT.whatsapp,
    opensAt: RESTAURANT_TIMINGS.opensAt,
    closesAt: RESTAURANT_TIMINGS.closesAt,
    status: 'open',
    category: 'Desserts',
    featured: false,
    rating: 4.3,
    cuisine: ['Desserts', 'Bakery'],
    priceRange: '₹₹',
    costForTwo: RESTAURANT_PRICING.costForTwo,
    menuFile: 'whitechocolate.csv'
  }
];

// Get current time in IST (India Standard Time)
export function getISTTime(): { hours: number; minutes: number; date: Date } {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istDate = new Date(utc + istOffset);
  
  return {
    hours: istDate.getHours(),
    minutes: istDate.getMinutes(),
    date: istDate
  };
}

// Helper function to check if restaurant is currently open (uses IST)
export function isRestaurantOpen(restaurant: Restaurant): boolean {
  const ist = getISTTime();
  const currentTime = ist.hours * 60 + ist.minutes;
  
  const [openHour, openMin] = restaurant.opensAt.split(':').map(Number);
  const [closeHour, closeMin] = restaurant.closesAt.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  return currentTime >= openTime && currentTime <= closeTime;
}

// Get countdown to opening time (uses IST)
export function getCountdownToOpen(restaurant: Restaurant): string {
  const ist = getISTTime();
  const [openHour, openMin] = restaurant.opensAt.split(':').map(Number);
  
  const currentMinutes = ist.hours * 60 + ist.minutes;
  const openMinutes = openHour * 60 + openMin;
  
  let diffMinutes = openMinutes - currentMinutes;
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60; // Add 24 hours if past opening time
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  return `Opens in ${hours}h ${minutes}m`;
}

// Convert 24-hour time to 12-hour IST format
export function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Get formatted timing string
export function getFormattedTimings(restaurant: Restaurant): string {
  return `${formatTime12Hour(restaurant.opensAt)} - ${formatTime12Hour(restaurant.closesAt)}`;
}
