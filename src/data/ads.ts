import type { Ad } from '../types';

/**
 * Ad Aspect Ratios by Placement:
 * - Mobile Hero: 16:9 (360x202px)
 * - Desktop Banner: 72:20 (720x200px)
 * - Mobile Carousel: 1:1 (300x300px)
 * - Sidebar: 9:16 (300x533px)
 * - Footer Banner: 7:1 (1200x171px)
 */

export const ads: Ad[] = [
  {
    id: 'hero-1',
    title: 'Special Offer - Biryani',
    imageUrl: '/images/cc.jpeg',
    aspectRatio: '16:9', // Mobile hero: 360x202
    placement: 'hero',
    priority: 1
  },
  {
    id: 'hero-2',
    title: 'Cafe Special',
    imageUrl: '/images/cc2.jpeg',
    aspectRatio: '16:9',
    placement: 'hero',
    priority: 2
  },
  {
    id: 'hero-3',
    title: 'Dessert Delights',
    imageUrl: '/images/cc3.jpeg',
    aspectRatio: '16:9',
    placement: 'hero',
    priority: 3
  },
  {
    id: 'banner-1',
    title: 'Desktop Banner - Special Offer',
    imageUrl: '/images/cc.jpeg',
    aspectRatio: '72:20', // Desktop banner: 720x200
    placement: 'banner',
    priority: 1
  },
  {
    id: 'carousel-1',
    title: 'Carousel Ad 1',
    imageUrl: '/images/cc.jpeg',
    aspectRatio: '1:1', // Mobile carousel: 300x300
    placement: 'carousel',
    priority: 1
  },
  {
    id: 'carousel-2',
    title: 'Carousel Ad 2',
    imageUrl: '/images/cc2.jpeg',
    aspectRatio: '1:1',
    placement: 'carousel',
    priority: 2
  },
  {
    id: 'carousel-3',
    title: 'Carousel Ad 3',
    imageUrl: '/images/cc3.jpeg',
    aspectRatio: '1:1',
    placement: 'carousel',
    priority: 3
  }
];

/**
 * Get ads by placement
 */
export function getAdsByPlacement(placement: Ad['placement']): Ad[] {
  return ads
    .filter(ad => ad.placement === placement)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get random ad from placement
 */
export function getRandomAd(placement: Ad['placement']): Ad | null {
  const placementAds = getAdsByPlacement(placement);
  if (placementAds.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * placementAds.length);
  return placementAds[randomIndex];
}

/**
 * Ad rotation configuration
 * Defines how often ads should rotate (in milliseconds)
 */
export const AD_ROTATION_CONFIG = {
  hero: 5000,      // 5 seconds
  carousel: 3000,  // 3 seconds
  banner: 8000,    // 8 seconds
  sidebar: 10000   // 10 seconds
};
