/**
 * =====================================================
 * EXCLUSIVE OFFERS MANAGEMENT
 * =====================================================
 * 
 * HOW TO ADD A NEW OFFER:
 * 1. Copy an existing offer object
 * 2. Change the values
 * 3. Save the file
 * 
 * FIELDS EXPLAINED:
 * - id: Unique identifier (use lowercase, no spaces)
 * - dishName: Name of the dish on offer
 * - description: Short description of the offer
 * - restaurantId: Must match restaurant id from restaurants.ts
 * - restaurantName: Display name of restaurant
 * - originalPrice: Original price in rupees
 * - offerPrice: Discounted price in rupees
 * - discountPercent: Discount percentage (calculated automatically if not set)
 * - deliveryCharge: Delivery charge (0 for free delivery)
 * - startDate: When offer starts (YYYY-MM-DD format)
 * - endDate: When offer ends (YYYY-MM-DD format)
 * - isActive: Set to true to show, false to hide
 * - imageUrl: Optional image URL
 * - terms: Optional terms and conditions
 * =====================================================
 */

export interface ExclusiveOffer {
  id: string;
  dishName: string;
  description: string;
  restaurantId: string;
  restaurantName: string;
  originalPrice: number;
  offerPrice: number;
  discountPercent?: number;
  deliveryCharge: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  imageUrl?: string;
  terms?: string;
  vegNonVeg?: 'Veg' | 'Non-Veg';
}

/**
 * =====================================================
 * ADD YOUR OFFERS BELOW
 * =====================================================
 */
export const exclusiveOffers: ExclusiveOffer[] = [
  // -------- CUPS N CRUMBS OFFER --------
  {
    id: 'cnc-grill-sandwich',
    dishName: 'Grill Sandwich Combo',
    description: 'Buy 2 Grill Sandwiches, Get 1 Fruit Cake FREE! Freshly Grilled.',
    restaurantId: 'cupsncrumbs',
    restaurantName: 'Cups N Crumbs',
    originalPrice: 195,
    offerPrice: 180,
    discountPercent: 8,
    deliveryCharge: 0, // FREE delivery
    startDate: '2025-11-27',
    endDate: '2025-11-30',
    isActive: true,
    vegNonVeg: 'Veg',
    terms: 'Limited time offer. Valid 27-30 Nov 2025. FREE Delivery included.'
  },

  // -------- BONDHU RESTAURANT OFFER --------
  {
    id: 'bondhu-free-delivery',
    dishName: 'Free Delivery Special',
    description: 'FREE Delivery on orders above ₹350! Order your favorite Non-Veg dishes.',
    restaurantId: 'bandhu-hotel',
    restaurantName: 'Bondhu Restaurant',
    originalPrice: 350,
    offerPrice: 350,
    discountPercent: 0,
    deliveryCharge: 0,
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    isActive: true,
    vegNonVeg: 'Non-Veg',
    terms: 'Free delivery on orders above ₹350. Valid on all items.'
  },

  // -------- ADD MORE OFFERS HERE --------
  // Copy the template below and fill in your details:
  /*
  {
    id: 'unique-offer-id',
    dishName: 'Dish Name',
    description: 'Short description',
    restaurantId: 'restaurant-id',
    restaurantName: 'Restaurant Name',
    originalPrice: 200,
    offerPrice: 150,
    discountPercent: 25,
    deliveryCharge: 0,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    vegNonVeg: 'Veg',
    terms: 'Terms and conditions'
  },
  */
];

/**
 * Get all active offers (checks date range and isActive flag)
 */
export function getActiveOffers(): ExclusiveOffer[] {
  const now = new Date();
  
  return exclusiveOffers.filter(offer => {
    if (!offer.isActive) return false;
    
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);
    endDate.setHours(23, 59, 59); // Include the entire end date
    
    return now >= startDate && now <= endDate;
  });
}

/**
 * Get offers by restaurant
 */
export function getOffersByRestaurant(restaurantId: string): ExclusiveOffer[] {
  return getActiveOffers().filter(offer => offer.restaurantId === restaurantId);
}

/**
 * Calculate discount percentage if not provided
 */
export function calculateDiscount(original: number, offer: number): number {
  return Math.round(((original - offer) / original) * 100);
}

/**
 * Check if offer is expiring soon (within 3 days)
 */
export function isExpiringSoon(endDate: string): boolean {
  const end = new Date(endDate);
  const now = new Date();
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0;
}

/**
 * Get remaining days for offer
 */
export function getRemainingDays(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
