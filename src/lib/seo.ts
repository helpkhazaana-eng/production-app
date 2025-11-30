// SEO Utility for Khazaana Food Ordering Platform
// Comprehensive SEO with location-based keywords and structured data

// Get site URL dynamically (Vercel compatible)
const getSiteUrl = () => import.meta.env.PUBLIC_SITE_URL || import.meta.env.SITE || 'https://khazaana.co.in';

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  structuredData?: any;
}

// Location-based keywords
export const LOCATION_KEYWORDS = {
  primary: 'Aurangabad',
  secondary: ['Suti', 'West Bengal', 'College More', 'DNC College'],
  nearby: ['Murshidabad', 'Berhampore', 'Jangipur', 'Lalgola'],
  pincode: '742201'
};

// Food-related keywords for SEO
export const FOOD_KEYWORDS = {
  biryani: [
    'best biryani in Aurangabad',
    'biryani near me',
    'chicken biryani Aurangabad',
    'mutton biryani Suti',
    'biryani delivery Aurangabad',
    'authentic biryani West Bengal',
    'Kolkata Arsalan Biryani Aurangabad'
  ],
  chinese: [
    'best Chinese food Aurangabad',
    'Chinese restaurant near me',
    'Chinese food delivery Aurangabad',
    'Aaviora Chinese Aurangabad',
    'fried rice Aurangabad',
    'chowmein near me'
  ],
  cafe: [
    'best cafe in Aurangabad',
    'Cups N Crumbs Aurangabad',
    'coffee shop near me',
    'bakery Aurangabad',
    'cafe near DNC College',
    'best coffee Suti'
  ],
  general: [
    'food delivery Aurangabad',
    'online food order Aurangabad',
    'restaurants near me',
    'food near DNC College',
    'home delivery Suti',
    'best restaurants Aurangabad',
    'order food online West Bengal',
    'Khazaana food delivery',
    'food delivery 742201',
    'restaurants in Murshidabad district'
  ]
};

// Generate comprehensive meta keywords
export function generateMetaKeywords(category?: string): string {
  const baseKeywords = [
    'Khazaana',
    'food delivery Aurangabad',
    'online food order Aurangabad',
    'restaurants Aurangabad',
    'food near me',
    'Suti food delivery',
    'West Bengal restaurants',
    '742201 food delivery',
    'College More restaurants',
    'DNC College food'
  ];

  let categoryKeywords: string[] = [];
  
  if (category) {
    switch (category.toLowerCase()) {
      case 'biryani':
        categoryKeywords = FOOD_KEYWORDS.biryani;
        break;
      case 'chinese':
        categoryKeywords = FOOD_KEYWORDS.chinese;
        break;
      case 'cafe':
        categoryKeywords = FOOD_KEYWORDS.cafe;
        break;
      default:
        categoryKeywords = FOOD_KEYWORDS.general;
    }
  } else {
    categoryKeywords = FOOD_KEYWORDS.general;
  }

  return [...baseKeywords, ...categoryKeywords].join(', ');
}

// Generate structured data for local business
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: 'Khazaana Food Ordering Platform',
    image: `${getSiteUrl()}/images/logo.png`,
    '@id': getSiteUrl(),
    url: getSiteUrl(),
    telephone: '+91-8695902696',
    priceRange: '₹₹',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'College More, near DNC College',
      addressLocality: 'Aurangabad',
      addressRegion: 'West Bengal',
      postalCode: '742201',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 24.619968473610793,
      longitude: 88.0229246716395
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '09:00',
      closes: '21:00'
    },
    servesCuisine: ['Indian', 'Chinese', 'Biryani', 'Mughlai', 'Cafe', 'Bakery'],
    acceptsReservations: 'False',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '250'
    }
  };
}

// Generate restaurant-specific structured data
export function generateRestaurantSchema(restaurant: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    image: `${getSiteUrl()}/images/restaurants/${restaurant.id}.jpg`,
    '@id': `${getSiteUrl()}/restaurants/${restaurant.id}/`,
    url: `${getSiteUrl()}/restaurants/${restaurant.id}/`,
    telephone: `+91-${restaurant.phone}`,
    priceRange: restaurant.priceRange,
    servesCuisine: restaurant.cuisine,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'College More, near DNC College',
      addressLocality: 'Aurangabad',
      addressRegion: 'Suti, West Bengal',
      postalCode: '742201',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 24.75,
      longitude: 88.2
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '09:00',
      closes: '21:00'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: restaurant.rating.toString(),
      reviewCount: '50'
    }
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${getSiteUrl()}${item.url}`
    }))
  };
}

// Generate menu structured data
export function generateMenuSchema(restaurant: any, menuItems: any[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: `${restaurant.name} Menu`,
    description: `Full menu of ${restaurant.name} in Aurangabad`,
    hasMenuSection: menuItems.map(item => ({
      '@type': 'MenuSection',
      name: item.category,
      hasMenuItem: {
        '@type': 'MenuItem',
        name: item.itemName,
        description: item.description || '',
        offers: {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: 'INR'
        },
        suitableForDiet: item.vegNonVeg === 'Veg' ? 'https://schema.org/VegetarianDiet' : undefined
      }
    }))
  };
}

// SEO-optimized title generator (max 60 chars for optimal display)
export function generateSEOTitle(
  pageName: string,
  restaurantName?: string,
  category?: string
): string {
  if (restaurantName && category) {
    return `${restaurantName} - ${category} | Khazaana`;
  } else if (restaurantName) {
    return `${restaurantName} Menu | Khazaana`;
  } else if (pageName === 'Home') {
    return `Khazaana - Food Delivery in Aurangabad`;
  } else if (pageName === 'Restaurants') {
    return `Restaurants | Khazaana Aurangabad`;
  } else {
    return `${pageName} | Khazaana`;
  }
}

// SEO-optimized description generator (max 155 chars for optimal display)
export function generateSEODescription(
  pageName: string,
  restaurantName?: string,
  cuisine?: string[]
): string {
  if (restaurantName && cuisine) {
    return `Order ${cuisine.slice(0, 2).join(', ')} from ${restaurantName} in Aurangabad. Fast delivery, best prices. Call 8695902696.`;
  } else if (pageName === 'Home') {
    return `Order food online in Aurangabad, West Bengal. Biryani, Chinese, cafe items delivered fast. Call 8695902696.`;
  } else if (pageName === 'Restaurants') {
    return `Best restaurants in Aurangabad. Order biryani, Chinese food online. Fast delivery near DNC College.`;
  } else {
    return `${pageName} - Khazaana Food Delivery in Aurangabad. Order online now.`;
  }
}
