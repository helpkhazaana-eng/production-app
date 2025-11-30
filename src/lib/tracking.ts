/**
 * Conversion Tracking Utility for Meta Ads & Google Ads
 * 
 * This file provides functions to track conversions and events
 * for both Meta (Facebook) Pixel and Google Ads.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Replace PIXEL_ID in BaseLayout.astro with your Meta Pixel ID
 * 2. Replace GTM-XXXXXXX with your Google Tag Manager Container ID
 * 3. Replace AW-XXXXXXXXX with your Google Ads Conversion ID
 * 4. Replace YOUR_FB_APP_ID with your Facebook App ID
 */

// Declare global types for tracking
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Track Meta Pixel Events
 */
export const MetaPixel = {
  // Track page view (automatically called on page load)
  pageView: () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  },

  // Track when user views content (e.g., restaurant menu)
  viewContent: (params: {
    content_name: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    value?: number;
    currency?: string;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        ...params,
        currency: params.currency || 'INR'
      });
    }
  },

  // Track when user adds item to cart
  addToCart: (params: {
    content_name: string;
    content_ids: string[];
    content_type?: string;
    value: number;
    currency?: string;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        ...params,
        currency: params.currency || 'INR'
      });
    }
  },

  // Track when user initiates checkout
  initiateCheckout: (params: {
    content_ids?: string[];
    content_type?: string;
    num_items: number;
    value: number;
    currency?: string;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        ...params,
        currency: params.currency || 'INR'
      });
    }
  },

  // Track when user completes purchase
  purchase: (params: {
    content_ids: string[];
    content_type?: string;
    num_items: number;
    value: number;
    currency?: string;
    order_id?: string;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        ...params,
        currency: params.currency || 'INR'
      });
    }
  },

  // Track leads (e.g., phone number submission)
  lead: (params?: {
    content_name?: string;
    content_category?: string;
    value?: number;
    currency?: string;
  }) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', params || {});
    }
  },

  // Track search
  search: (searchString: string) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Search', {
        search_string: searchString
      });
    }
  },

  // Custom event
  custom: (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, params);
    }
  }
};

/**
 * Track Google Ads Events
 */
export const GoogleAds = {
  // Track conversion (replace with your conversion label)
  conversion: (params: {
    send_to: string; // Format: 'AW-XXXXXXXXX/CONVERSION_LABEL'
    value?: number;
    currency?: string;
    transaction_id?: string;
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        ...params,
        currency: params.currency || 'INR'
      });
    }
  },

  // Track purchase conversion
  purchase: (params: {
    transaction_id: string;
    value: number;
    currency?: string;
    items?: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        ...params,
        currency: params.currency || 'INR'
      });
    }
  },

  // Track add to cart
  addToCart: (params: {
    currency?: string;
    value: number;
    items: Array<{
      item_id: string;
      item_name: string;
      price: number;
      quantity: number;
    }>;
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        ...params,
        currency: params.currency || 'INR'
      });
    }
  },

  // Track begin checkout
  beginCheckout: (params: {
    currency?: string;
    value: number;
    items: Array<{
      item_id: string;
      item_name: string;
      price: number;
      quantity: number;
    }>;
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        ...params,
        currency: params.currency || 'INR'
      });
    }
  },

  // Track view item
  viewItem: (params: {
    currency?: string;
    value: number;
    items: Array<{
      item_id: string;
      item_name: string;
      price: number;
    }>;
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        ...params,
        currency: params.currency || 'INR'
      });
    }
  },

  // Track search
  search: (searchTerm: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchTerm
      });
    }
  },

  // Track phone call click
  phoneCall: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-XXXXXXXXX/PHONE_CONVERSION_LABEL'
      });
    }
  }
};

/**
 * Combined tracking - fires both Meta and Google events
 */
export const Track = {
  // Track add to cart on both platforms
  addToCart: (item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }) => {
    MetaPixel.addToCart({
      content_name: item.name,
      content_ids: [item.id],
      content_type: 'product',
      value: item.price * item.quantity
    });

    GoogleAds.addToCart({
      value: item.price * item.quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }]
    });
  },

  // Track checkout initiation on both platforms
  initiateCheckout: (params: {
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    total: number;
  }) => {
    MetaPixel.initiateCheckout({
      content_ids: params.items.map(i => i.id),
      content_type: 'product',
      num_items: params.items.reduce((sum, i) => sum + i.quantity, 0),
      value: params.total
    });

    GoogleAds.beginCheckout({
      value: params.total,
      items: params.items.map(i => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity
      }))
    });
  },

  // Track purchase on both platforms
  purchase: (params: {
    orderId: string;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    total: number;
  }) => {
    MetaPixel.purchase({
      content_ids: params.items.map(i => i.id),
      content_type: 'product',
      num_items: params.items.reduce((sum, i) => sum + i.quantity, 0),
      value: params.total,
      order_id: params.orderId
    });

    GoogleAds.purchase({
      transaction_id: params.orderId,
      value: params.total,
      items: params.items.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }))
    });
  },

  // Track restaurant/menu view
  viewRestaurant: (restaurant: {
    id: string;
    name: string;
    category?: string;
  }) => {
    MetaPixel.viewContent({
      content_name: restaurant.name,
      content_category: restaurant.category || 'Restaurant',
      content_ids: [restaurant.id],
      content_type: 'product_group'
    });

    GoogleAds.viewItem({
      value: 0,
      items: [{
        item_id: restaurant.id,
        item_name: restaurant.name,
        price: 0
      }]
    });
  },

  // Track search
  search: (query: string) => {
    MetaPixel.search(query);
    GoogleAds.search(query);
  }
};

export default Track;
