/**
 * Restaurant Meta Generator
 * Generates SEO-optimized metadata for restaurant pages
 */

import type { Restaurant, MenuItem } from '../types';

// Location constants for Khazaana
export const LOCATION = {
  city: 'Aurangabad',
  locality: 'College More',
  district: 'Murshidabad',
  state: 'West Bengal',
  country: 'India',
  pincode: '742201',
  landmarks: ['DNC College', 'College More', 'Suti'],
  coordinates: {
    latitude: 24.619968473610793,
    longitude: 88.0229246716395
  }
};

// Domain is set dynamically from environment or Astro.site
export const SITE_CONFIG = {
  domain: import.meta.env.SITE_URL || import.meta.env.SITE || 'https://khazaana.co.in',
  name: 'Khazaana',
  phone: '+91-8695902696',
  phoneBackup: '+91-8649851034',
  email: 'helpkhazaana@gmail.com',
  instagram: 'https://www.instagram.com/_khazaana/',
  googleMaps: 'https://www.google.com/maps?q=24.619968473610793,88.0229246716395'
};

export interface RestaurantMeta {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

/**
 * Generate long-tail keywords for a restaurant
 */
export function generateRestaurantKeywords(restaurant: Restaurant): string[] {
  const { name, cuisine, category, rating } = restaurant;
  const { city, locality, pincode, landmarks, state } = LOCATION;
  
  const keywords: string[] = [
    // Brand keywords
    name,
    `${name} ${city}`,
    `${name} menu`,
    `${name} online order`,
    
    // Cuisine keywords
    ...cuisine.map(c => `${c} restaurant ${city}`),
    ...cuisine.map(c => `best ${c} in ${locality}`),
    ...cuisine.map(c => `${c} food near ${landmarks[0]}`),
    ...cuisine.map(c => `${c} delivery ${city}`),
    
    // Category keywords
    `${category} in ${city}`,
    `best ${category} near me`,
    `${category} ${locality}`,
    
    // Location keywords
    `restaurant near ${landmarks[0]}`,
    `food delivery ${locality}`,
    `online food order ${city}`,
    `restaurant ${pincode}`,
    `best restaurant ${locality} ${city}`,
    `food near ${landmarks.join(', ')}`,
    
    // Rating keywords
    rating >= 4.5 ? `top rated restaurant ${city}` : '',
    rating >= 4.0 ? `highly rated ${category} ${city}` : '',
    
    // Long-tail keywords
    `order ${cuisine[0]} online ${city}`,
    `${cuisine[0]} home delivery ${locality}`,
    `best place to eat ${city}`,
    `affordable restaurant ${city}`,
    `student friendly restaurant near ${landmarks[0]}`,
    `late night food ${city}`,
    
    // Regional keywords
    `${city} ${state} restaurant`,
    `food delivery ${city} ${state}`,
    `Khazaana ${name}`,
    `Khazaana food delivery`
  ].filter(Boolean);
  
  return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Generate SEO title for restaurant page
 */
export function generateRestaurantTitle(restaurant: Restaurant): string {
  const { name, cuisine, category, rating } = restaurant;
  const { city, locality } = LOCATION;
  
  // Format: "Restaurant Name - Best Cuisine in Locality, City | Menu & Order Online"
  const ratingText = rating >= 4.5 ? 'Top Rated' : rating >= 4.0 ? 'Highly Rated' : '';
  const cuisineText = cuisine.slice(0, 2).join(' & ');
  
  return `${name} - ${ratingText ? ratingText + ' ' : ''}${cuisineText} Restaurant in ${locality}, ${city} | Menu, Reviews & Order Online | Khazaana`;
}

/**
 * Generate SEO description for restaurant page
 */
export function generateRestaurantDescription(
  restaurant: Restaurant, 
  menuItems?: MenuItem[]
): string {
  const { name, cuisine, category, rating, costForTwo, priceRange } = restaurant;
  const { city, locality, landmarks, pincode } = LOCATION;
  
  // Get popular items if available
  const popularItems = menuItems 
    ? menuItems.slice(0, 3).map(item => item.itemName).join(', ')
    : '';
  
  const ratingText = `★ ${rating}/5 rated`;
  const priceText = `₹${costForTwo} for two`;
  const cuisineText = cuisine.join(', ');
  
  let description = `Order delicious ${cuisineText} from ${name} in ${locality}, ${city}. `;
  description += `${ratingText}. ${priceText}. `;
  
  if (popularItems) {
    description += `Try our ${popularItems}. `;
  }
  
  description += `Fast delivery near ${landmarks[0]}, ${landmarks[1]}. `;
  description += `Open 9 AM - 9 PM. Order online on Khazaana or call ${SITE_CONFIG.phone}. `;
  description += `Best ${category.toLowerCase()} in ${pincode}.`;
  
  return description.slice(0, 160); // Keep under 160 chars for SEO
}

/**
 * Generate extended description for content
 */
export function generateRestaurantLongDescription(
  restaurant: Restaurant,
  menuItems?: MenuItem[]
): string {
  const { name, cuisine, category, rating, costForTwo } = restaurant;
  const { city, locality, landmarks, pincode, state } = LOCATION;
  
  const vegItems = menuItems?.filter(item => item.vegNonVeg === 'Veg').length || 0;
  const nonVegItems = menuItems?.filter(item => item.vegNonVeg === 'Non-Veg').length || 0;
  const totalItems = menuItems?.length || 0;
  
  return `
${name} is one of the best ${cuisine.join(' and ')} restaurants in ${locality}, ${city}, ${state}. 
Located near ${landmarks.join(', ')}, we serve authentic ${category.toLowerCase()} cuisine with a rating of ${rating}/5.

Our menu features ${totalItems} items including ${vegItems} vegetarian and ${nonVegItems} non-vegetarian options.
Average cost for two people is just ₹${costForTwo}, making us an affordable choice for students and families near ${landmarks[0]}.

Whether you're looking for the best ${cuisine[0]} in ${city} or searching for top-rated restaurants in ${pincode}, 
${name} on Khazaana is your perfect destination. We offer fast home delivery across ${locality} and nearby areas.

Order online through Khazaana for the best ${category.toLowerCase()} experience in ${city}, ${state}.
  `.trim();
}

/**
 * Generate complete meta object for restaurant
 */
export function generateRestaurantMeta(
  restaurant: Restaurant,
  menuItems?: MenuItem[]
): RestaurantMeta {
  const title = generateRestaurantTitle(restaurant);
  const description = generateRestaurantDescription(restaurant, menuItems);
  const keywords = generateRestaurantKeywords(restaurant).join(', ');
  const canonicalUrl = `${SITE_CONFIG.domain}/restaurants/${restaurant.id}`;
  const ogImage = `${SITE_CONFIG.domain}/images/restaurants/${restaurant.id}.jpg`;
  
  return {
    title,
    description,
    keywords,
    canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogUrl: canonicalUrl,
    twitterTitle: title.slice(0, 70), // Twitter title limit
    twitterDescription: description,
    twitterImage: ogImage
  };
}

/**
 * Generate FAQ schema content for restaurant
 */
export function generateRestaurantFAQs(restaurant: Restaurant): Array<{question: string, answer: string}> {
  const { name, cuisine, rating, costForTwo } = restaurant;
  const { city, locality, landmarks } = LOCATION;
  
  return [
    {
      question: `What is the rating of ${name}?`,
      answer: `${name} has a rating of ${rating} out of 5 stars on Khazaana.`
    },
    {
      question: `What cuisine does ${name} serve?`,
      answer: `${name} serves ${cuisine.join(', ')} cuisine in ${locality}, ${city}.`
    },
    {
      question: `What is the average cost at ${name}?`,
      answer: `The average cost for two people at ${name} is approximately ₹${costForTwo}.`
    },
    {
      question: `Where is ${name} located?`,
      answer: `${name} is located at ${locality}, near ${landmarks[0]}, ${city}, West Bengal - 742201.`
    },
    {
      question: `What are the opening hours of ${name}?`,
      answer: `${name} is open from 9:00 AM to 9:00 PM, all days of the week.`
    },
    {
      question: `Does ${name} offer home delivery?`,
      answer: `Yes, ${name} offers home delivery through Khazaana in ${locality} and nearby areas of ${city}.`
    },
    {
      question: `How can I order from ${name}?`,
      answer: `You can order from ${name} online through Khazaana website or call ${SITE_CONFIG.phone} for orders.`
    }
  ];
}
