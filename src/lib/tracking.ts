/**
 * Conversion Tracking Utility for GA4, Meta Ads & Google Ads
 * 
 * GA4 Measurement ID: G-VSLCVT356G
 * 
 * This file provides functions to track conversions and events
 * for Google Analytics 4, Meta (Facebook) Pixel, and Google Ads.
 * 
 * FEATURES TRACKED:
 * - Page views (automatic)
 * - Scroll depth (25%, 50%, 75%, 100%)
 * - Time on page (30s, 60s, 2min, 5min)
 * - Outbound clicks
 * - Phone calls
 * - WhatsApp clicks
 * - Add to cart
 * - Checkout initiation
 * - Purchase completion
 * - Search queries
 * - Restaurant views
 * - User engagement
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
 * Track Google Analytics 4 Events
 */
export const GA4 = {
  // Custom event tracking
  event: (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  },

  // Set user properties for segmentation
  setUserProperties: (properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', 'user_properties', properties);
    }
  },

  // Set user ID for cross-device tracking
  setUserId: (userId: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-VSLCVT356G', {
        'user_id': userId
      });
    }
  },

  // Track restaurant view
  viewRestaurant: (restaurant: { id: string; name: string; cuisine?: string }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        'currency': 'INR',
        'value': 0,
        'items': [{
          'item_id': restaurant.id,
          'item_name': restaurant.name,
          'item_category': restaurant.cuisine || 'Restaurant'
        }]
      });
    }
  },

  // Track menu item view
  viewMenuItem: (item: { id: string; name: string; price: number; category?: string; restaurant?: string }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        'currency': 'INR',
        'value': item.price,
        'items': [{
          'item_id': item.id,
          'item_name': item.name,
          'item_category': item.category,
          'item_brand': item.restaurant,
          'price': item.price
        }]
      });
    }
  },

  // Track add to cart
  addToCart: (item: { id: string; name: string; price: number; quantity: number; category?: string; restaurant?: string }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        'currency': 'INR',
        'value': item.price * item.quantity,
        'items': [{
          'item_id': item.id,
          'item_name': item.name,
          'item_category': item.category,
          'item_brand': item.restaurant,
          'price': item.price,
          'quantity': item.quantity
        }]
      });
    }
  },

  // Track remove from cart
  removeFromCart: (item: { id: string; name: string; price: number; quantity: number }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'remove_from_cart', {
        'currency': 'INR',
        'value': item.price * item.quantity,
        'items': [{
          'item_id': item.id,
          'item_name': item.name,
          'price': item.price,
          'quantity': item.quantity
        }]
      });
    }
  },

  // Track view cart
  viewCart: (items: Array<{ id: string; name: string; price: number; quantity: number }>, total: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_cart', {
        'currency': 'INR',
        'value': total,
        'items': items.map(item => ({
          'item_id': item.id,
          'item_name': item.name,
          'price': item.price,
          'quantity': item.quantity
        }))
      });
    }
  },

  // Track begin checkout
  beginCheckout: (items: Array<{ id: string; name: string; price: number; quantity: number }>, total: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        'currency': 'INR',
        'value': total,
        'items': items.map(item => ({
          'item_id': item.id,
          'item_name': item.name,
          'price': item.price,
          'quantity': item.quantity
        }))
      });
    }
  },

  // Track purchase
  purchase: (params: {
    orderId: string;
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    total: number;
    tax?: number;
    shipping?: number;
    restaurant?: string;
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        'transaction_id': params.orderId,
        'currency': 'INR',
        'value': params.total,
        'tax': params.tax || 0,
        'shipping': params.shipping || 0,
        'affiliation': params.restaurant || 'Khazaana',
        'items': params.items.map(item => ({
          'item_id': item.id,
          'item_name': item.name,
          'price': item.price,
          'quantity': item.quantity
        }))
      });
    }
  },

  // Track search
  search: (searchTerm: string, resultsCount?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        'search_term': searchTerm,
        'results_count': resultsCount
      });
    }
  },

  // Track share
  share: (method: string, contentType: string, itemId: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        'method': method,
        'content_type': contentType,
        'item_id': itemId
      });
    }
  },

  // Track login
  login: (method: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login', {
        'method': method
      });
    }
  },

  // Track sign up
  signUp: (method: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        'method': method
      });
    }
  },

  // Track generate lead
  generateLead: (value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generate_lead', {
        'currency': 'INR',
        'value': value || 0
      });
    }
  },

  // Track exception/error
  exception: (description: string, fatal: boolean = false) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        'description': description,
        'fatal': fatal
      });
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
