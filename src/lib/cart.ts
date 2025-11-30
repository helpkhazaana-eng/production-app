import type { Cart, CartItem, MenuItem, Order } from '../types';
import { logger } from './logger';

const CART_STORAGE_KEY = 'khazaana_cart';
const ORDER_HISTORY_KEY = 'khazaana_order_history';

/**
 * Get cart from localStorage
 */
export function getCart(): Cart {
  if (typeof window === 'undefined') {
    return createEmptyCart();
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const rawCart = JSON.parse(stored);
      const normalizedCart: Cart = {
        items: rawCart.items || [],
        restaurantId: rawCart.restaurantId || null,
        restaurantName: rawCart.restaurantName || null,
        subtotal: Number(rawCart.subtotal) || 0,
        tax: Number(rawCart.tax) || 0,
        total: Number(rawCart.total) || 0,
        deliveryFee: Number(rawCart.deliveryFee) || 0
      };

      const recalculatedCart = calculateCartTotals(normalizedCart);
      logger.debug('Cart loaded from localStorage', { itemCount: recalculatedCart.items?.length || 0 }, 'CART');
      return recalculatedCart;
    }
  } catch (error) {
    logger.error('Failed to load cart from localStorage', error instanceof Error ? error : new Error(String(error)), 'CART');
  }

  return createEmptyCart();
}

/**
 * Save cart to localStorage
 */
export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    logger.debug('Cart saved to localStorage', { itemCount: cart.items.length, total: cart.total }, 'CART');
    
    // Dispatch custom event for cart updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    }
  } catch (error) {
    logger.error('Failed to save cart to localStorage', error instanceof Error ? error : new Error(String(error)), 'CART');
  }
}

/**
 * Create empty cart
 */
export function createEmptyCart(): Cart {
  return {
    items: [],
    restaurantId: null,
    restaurantName: null,
    subtotal: 0,
    tax: 0,
    total: 0,
    deliveryFee: 0
  };
}

/**
 * Add item to cart
 * Returns error message if item is from different restaurant
 */
export function addToCart(
  cart: Cart,
  item: MenuItem,
  restaurantId: string,
  restaurantName: string,
  quantity: number = 1
): { cart: Cart; error?: string } {
  // Check if cart has items from different restaurant
  if (cart.restaurantId && cart.restaurantId !== restaurantId) {
    logger.warn(
      'Attempted to add item from different restaurant',
      { currentRestaurant: cart.restaurantName, attemptedRestaurant: restaurantName },
      'CART'
    );
    return {
      cart,
      error: `Your cart contains items from ${cart.restaurantName}. Please clear your cart to order from ${restaurantName}.`
    };
  }

  const newCart = { ...cart };

  // Set restaurant if cart is empty
  if (!newCart.restaurantId) {
    newCart.restaurantId = restaurantId;
    newCart.restaurantName = restaurantName;
  }

  // Check if item already exists in cart
  const existingItemIndex = newCart.items.findIndex(
    cartItem => cartItem.itemName === item.itemName
  );

  if (existingItemIndex >= 0) {
    // Update quantity
    newCart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    const cartItem: CartItem = {
      ...item,
      restaurantId,
      restaurantName,
      quantity
    };
    newCart.items.push(cartItem);
  }

  // Recalculate totals
  const updatedCart = calculateCartTotals(newCart);
  saveCart(updatedCart);

  logger.info(
    `Item added to cart: ${item.itemName}`,
    { quantity, price: item.price, restaurantName },
    'CART'
  );

  return { cart: updatedCart };
}

/**
 * Remove item from cart
 */
export function removeFromCart(cart: Cart, itemName: string): Cart {
  const newCart = {
    ...cart,
    items: cart.items.filter(item => item.itemName !== itemName)
  };

  // Clear restaurant if cart is empty
  if (newCart.items.length === 0) {
    newCart.restaurantId = null;
    newCart.restaurantName = null;
  }

  const updatedCart = calculateCartTotals(newCart);
  saveCart(updatedCart);

  return updatedCart;
}

/**
 * Update item quantity
 */
export function updateQuantity(cart: Cart, itemName: string, quantity: number): Cart {
  if (quantity <= 0) {
    return removeFromCart(cart, itemName);
  }

  const newCart = {
    ...cart,
    items: cart.items.map(item =>
      item.itemName === itemName ? { ...item, quantity } : item
    )
  };

  const updatedCart = calculateCartTotals(newCart);
  saveCart(updatedCart);

  return updatedCart;
}

/**
 * Clear entire cart
 */
export function clearCart(): Cart {
  const emptyCart = createEmptyCart();
  saveCart(emptyCart);
  return emptyCart;
}

/**
 * Calculate cart totals
 * Tax is currently 0% as per Admin_Config default
 */
export function calculateCartTotals(cart: Cart): Cart {
  const subtotal = cart.items.reduce(
    (sum, item) => {
      // Use discounted price for ₹195 items (₹180)
      const actualPrice = item.price === 195 ? 180 : item.price;
      return sum + (actualPrice * item.quantity);
    },
    0
  );

  const baseSubtotal = Math.round(subtotal * 100) / 100;

  // Delivery fee logic
  let deliveryFee = 30; // Standard delivery charge

  if (!cart.items.length) {
    deliveryFee = 0;
  } else if (cart.restaurantId === 'cupsncrumbs' && baseSubtotal >= 100) {
    deliveryFee = 0;
  } else if (cart.restaurantId === 'bandhu-hotel' && baseSubtotal >= 350) {
    deliveryFee = 0;
  }

  const taxRate = 0; // 0% GST as per requirements
  const tax = baseSubtotal * taxRate;
  const total = baseSubtotal + tax + deliveryFee;

  return {
    ...cart,
    subtotal: baseSubtotal,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100
  };
}

/**
 * Save order to history
 */
export function saveOrderToHistory(order: Order): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getOrderHistory();
    history.unshift(order); // Add to beginning
    
    // Keep only last 50 orders
    const trimmedHistory = history.slice(0, 50);
    
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving order to history:', error);
  }
}

/**
 * Get order history from localStorage
 */
export function getOrderHistory(): Order[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(ORDER_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading order history:', error);
  }

  return [];
}

/**
 * Generate unique order ID
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
}
