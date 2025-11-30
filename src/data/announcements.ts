/**
 * Centralized Announcement Management System
 * Admin can update announcements here
 * Announcements are displayed on homepage and other pages
 */

export interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promo';
  active: boolean;
  startDate?: string;
  endDate?: string;
  link?: string;
  linkText?: string;
}

/**
 * Active Announcements
 * Set active: false to hide an announcement
 * Set startDate and endDate for time-limited announcements
 */
export const announcements: Announcement[] = [
  {
    id: 'bondhu-free-delivery',
    message: '🚚 Bondhu: FREE Delivery above ₹350!',
    type: 'promo',
    active: true,
    link: '/restaurants/bandhu-hotel',
    linkText: 'Order'
  },
  {
    id: 'delivery-registration',
    message: '📞 Delivery & Registration: 8695902696',
    type: 'info',
    active: true,
    link: 'tel:+918695902696',
    linkText: 'Call'
  },
  // Add more announcements here as needed
  // Example:
  // {
  //   id: 'special-offer',
  //   message: '🎉 Special Offer: Get 20% off on your first order!',
  //   type: 'promo',
  //   active: true,
  //   startDate: '2024-01-01',
  //   endDate: '2024-01-31',
  //   link: '/restaurants',
  //   linkText: 'Order Now'
  // }
];

/**
 * Get active announcements
 * Filters by active status and date range
 */
export function getActiveAnnouncements(): Announcement[] {
  const now = new Date();
  
  return announcements.filter(announcement => {
    if (!announcement.active) return false;
    
    // Check date range if specified
    if (announcement.startDate) {
      const startDate = new Date(announcement.startDate);
      if (now < startDate) return false;
    }
    
    if (announcement.endDate) {
      const endDate = new Date(announcement.endDate);
      if (now > endDate) return false;
    }
    
    return true;
  });
}

/**
 * Get announcement style classes based on type
 */
export function getAnnouncementStyle(type: Announcement['type']): string {
  switch (type) {
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'promo':
      return 'bg-purple-50 border-purple-200 text-purple-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
}
