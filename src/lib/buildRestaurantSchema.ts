/**
 * Restaurant Schema Builder
 * Generates JSON-LD structured data for restaurant pages
 */

import type { Restaurant, MenuItem } from '../types';
import { LOCATION, SITE_CONFIG, generateRestaurantFAQs } from './generateRestaurantMeta';

/**
 * Build complete Restaurant schema (LocalBusiness subtype)
 */
export function buildRestaurantSchema(restaurant: Restaurant, menuItems?: MenuItem[]) {
  const { name, cuisine, category, rating, costForTwo, priceRange, phone, opensAt, closesAt } = restaurant;
  const { city, locality, state, pincode, landmarks, coordinates } = LOCATION;
  
  // Calculate review count based on rating (estimated)
  const reviewCount = Math.floor(rating * 15) + 20;
  
  // Get price range symbol
  const priceRangeMap: Record<string, string> = {
    '₹': '$',
    '₹₹': '$$',
    '₹₹₹': '$$$'
  };
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE_CONFIG.domain}/restaurants/${restaurant.id}#restaurant`,
    name: name,
    description: `${name} - Best ${cuisine.join(' & ')} restaurant in ${locality}, ${city}. Order online for fast delivery.`,
    url: `${SITE_CONFIG.domain}/restaurants/${restaurant.id}`,
    telephone: `+91-${phone}`,
    email: SITE_CONFIG.email,
    
    // Images
    image: [
      `${SITE_CONFIG.domain}/images/restaurants/${restaurant.id}.jpg`,
      `${SITE_CONFIG.domain}/images/logo.png`
    ],
    logo: `${SITE_CONFIG.domain}/images/logo.png`,
    
    // Price
    priceRange: priceRangeMap[priceRange] || '$$',
    
    // Cuisine
    servesCuisine: cuisine,
    
    // Address
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${locality}, near ${landmarks[0]}`,
      addressLocality: city,
      addressRegion: state,
      postalCode: pincode,
      addressCountry: 'IN'
    },
    
    // Geo coordinates
    geo: {
      '@type': 'GeoCoordinates',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    },
    
    // Area served
    areaServed: {
      '@type': 'City',
      name: city,
      containedInPlace: {
        '@type': 'State',
        name: state
      }
    },
    
    // Opening hours
    openingHoursSpecification: [
      {
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
        opens: opensAt,
        closes: closesAt
      }
    ],
    
    // Aggregate rating
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating.toString(),
      bestRating: '5',
      worstRating: '1',
      ratingCount: reviewCount.toString(),
      reviewCount: reviewCount.toString()
    },
    
    // Menu
    hasMenu: {
      '@type': 'Menu',
      '@id': `${SITE_CONFIG.domain}/restaurants/${restaurant.id}#menu`,
      name: `${name} Menu`,
      description: `Full menu of ${name} featuring ${cuisine.join(', ')} dishes`,
      url: `${SITE_CONFIG.domain}/restaurants/${restaurant.id}`,
      hasMenuSection: menuItems ? buildMenuSections(menuItems) : []
    },
    
    // Accepts reservations
    acceptsReservations: 'False',
    
    // Payment accepted
    paymentAccepted: 'Cash, UPI, Online Payment',
    currenciesAccepted: 'INR',
    
    // Contact point
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+91-${phone}`,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Bengali', 'Hindi']
    },
    
    // Same as (social links)
    sameAs: [
      SITE_CONFIG.instagram,
      SITE_CONFIG.googleMaps
    ],
    
    // Parent organization
    parentOrganization: {
      '@type': 'Organization',
      name: 'Khazaana',
      url: SITE_CONFIG.domain
    },
    
    // Potential action (order)
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.domain}/restaurants/${restaurant.id}`,
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform'
        ]
      },
      deliveryMethod: 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet'
    }
  };
}

/**
 * Build menu sections from menu items
 */
function buildMenuSections(menuItems: MenuItem[]) {
  // Group items by category
  const categories = [...new Set(menuItems.map(item => item.category))];
  
  return categories.map(category => {
    const categoryItems = menuItems.filter(item => item.category === category);
    
    return {
      '@type': 'MenuSection',
      name: category,
      hasMenuItem: categoryItems.slice(0, 5).map(item => ({
        '@type': 'MenuItem',
        name: item.itemName,
        description: item.description || `Delicious ${item.vegNonVeg.toLowerCase()} ${item.category.toLowerCase()}`,
        offers: {
          '@type': 'Offer',
          price: item.price.toString(),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock'
        },
        suitableForDiet: item.vegNonVeg === 'Veg' 
          ? 'https://schema.org/VegetarianDiet' 
          : undefined,
        nutrition: {
          '@type': 'NutritionInformation',
          suitableForDiet: item.vegNonVeg === 'Veg' ? 'Vegetarian' : 'Non-Vegetarian'
        }
      }))
    };
  });
}

/**
 * Build FAQ schema
 */
export function buildFAQSchema(restaurant: Restaurant) {
  const faqs = generateRestaurantFAQs(restaurant);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Build breadcrumb schema for restaurant page
 */
export function buildBreadcrumbSchema(restaurant: Restaurant) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_CONFIG.domain
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Restaurants',
        item: `${SITE_CONFIG.domain}/restaurants`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: restaurant.name,
        item: `${SITE_CONFIG.domain}/restaurants/${restaurant.id}`
      }
    ]
  };
}

/**
 * Build complete schema graph for restaurant page
 */
export function buildCompleteRestaurantSchema(restaurant: Restaurant, menuItems?: MenuItem[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildRestaurantSchema(restaurant, menuItems),
      buildFAQSchema(restaurant),
      buildBreadcrumbSchema(restaurant)
    ]
  };
}

/**
 * Build ItemList schema for restaurants listing page
 */
export function buildRestaurantsListSchema(restaurants: Restaurant[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best Restaurants in Aurangabad, West Bengal',
    description: 'Top-rated restaurants for online food delivery in Aurangabad, Suti, West Bengal',
    numberOfItems: restaurants.length,
    itemListElement: restaurants.map((restaurant, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Restaurant',
        name: restaurant.name,
        url: `${SITE_CONFIG.domain}/restaurants/${restaurant.id}`,
        servesCuisine: restaurant.cuisine,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: restaurant.rating.toString(),
          bestRating: '5'
        },
        priceRange: restaurant.priceRange
      }
    }))
  };
}

/**
 * Build WebPage schema
 */
export function buildWebPageSchema(
  title: string, 
  description: string, 
  url: string,
  restaurant?: Restaurant
) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Khazaana',
      url: SITE_CONFIG.domain
    },
    inLanguage: 'en-IN',
    dateModified: new Date().toISOString().split('T')[0]
  };
  
  if (restaurant) {
    schema.about = {
      '@type': 'Restaurant',
      name: restaurant.name,
      '@id': `${SITE_CONFIG.domain}/restaurants/${restaurant.id}#restaurant`
    };
    schema.mainEntity = {
      '@id': `${SITE_CONFIG.domain}/restaurants/${restaurant.id}#restaurant`
    };
  }
  
  return schema;
}
