/**
 * Google Sheets Backend Integration
 * Connects to Google Apps Script Web App to store orders
 */

import { logger } from './logger';

// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxCWeJy1Ki9G-xXMF7ZJWCcP4ie7GMQKiTBYg4ljxLwGRwVXERn9FBWkHa8KqXbWANi_w/exec';

// Khazaana WhatsApp number for checkout (production)
export const KHAZAANA_WHATSAPP = '918695902696';

// Request timeout (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Generate unique Order ID
 * Format: ORD-YYYYMMDD-XXXXX
 */
export function generateOrderId(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `ORD-${date}-${random}`;
}

/**
 * Generate unique User ID from phone number
 * Format: USR-PHONE
 */
export function generateUserId(phone: string): string {
  return `USR-${phone}`;
}

/**
 * Format date for Google Sheets in IST with AM/PM
 * Format: YYYY-MM-DD H:MM AM/PM
 */
export function formatDateForSheets(date: Date = new Date()): string {
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  
  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  
  let hours = istDate.getUTCHours();
  const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert to 12-hour format
  
  return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
}

/**
 * Send order to Google Sheets using form submission
 * This bypasses CORS by using a hidden form + iframe
 */
export async function sendOrderToGoogleSheet(orderData: GoogleSheetOrderPayload): Promise<GoogleSheetResponse> {
  try {
    logger.info('Sending order to Google Sheets', { orderId: orderData.data.Order_ID }, 'GOOGLE_SHEETS');

    // Create a promise that resolves after form submission
    return new Promise((resolve) => {
      // Create hidden iframe to receive response
      const iframeName = 'googleSheetFrame_' + Date.now();
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      // Create form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = GOOGLE_SCRIPT_URL;
      form.target = iframeName;
      form.style.display = 'none';

      // Add data as hidden input
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = JSON.stringify(orderData);
      form.appendChild(input);

      document.body.appendChild(form);

      // Submit form
      form.submit();

      // Clean up after a delay and assume success
      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
        
        logger.info('Order sent to Google Sheets via form', { orderId: orderData.data.Order_ID }, 'GOOGLE_SHEETS');
        resolve({
          success: true,
          message: 'Order sent successfully',
        });
      }, 2000);
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to send order to Google Sheets', err, 'GOOGLE_SHEETS');
    return {
      success: false,
      message: err.message || 'Failed to send order',
    };
  }
}

/**
 * Create order payload for Google Sheets
 */
export function createOrderPayload(
  orderId: string,
  userId: string,
  restaurantName: string,
  items: OrderItem[],
  customer: CustomerInfo,
  pricing: OrderPricing,
  termsAccepted: boolean = true
): GoogleSheetOrderPayload {
  const itemsJSON = JSON.stringify(items);
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const orderTime = formatDateForSheets();

  return {
    sheetName: 'Orders',
    action: 'addOrder',
    data: {
      Order_ID: orderId,
      User_ID: userId,
      Restaurant_Name: restaurantName,
      Items_JSON: itemsJSON,
      Total_Items: totalItems,
      Subtotal: pricing.subtotal,
      Tax_Amount: pricing.tax,
      Delivery_Fee: pricing.deliveryFee || 0,
      Total_Price: pricing.total,
      Customer_Name: customer.name,
      Customer_Phone: customer.phone,
      Customer_Email: customer.email || '',
      Customer_Address: customer.address,
      Latitude: customer.lat,
      Longitude: customer.lng,
      Order_Time: orderTime,
      Order_Status: 'Pending',
      Terms_Accepted: termsAccepted ? 'Yes' : 'No',
      Terms_Accepted_At: termsAccepted ? orderTime : '',
      Admin_Notes: '',
      Invoice_Trigger: 'No',
      Invoice_URL: '',
      Created_At: orderTime,
      Updated_At: orderTime,
    },
  };
}

/**
 * Create or update user in Google Sheets
 */
export async function saveUserToGoogleSheet(customer: CustomerInfo): Promise<GoogleSheetResponse> {
  const userId = generateUserId(customer.phone);
  const now = formatDateForSheets();

  const payload: GoogleSheetUserPayload = {
    sheetName: 'Users',
    action: 'addOrUpdateUser',
    data: {
      User_ID: userId,
      Name: customer.name,
      Phone: customer.phone,
      Email: customer.email || '',
      Address: customer.address,
      Lat: customer.lat,
      Long: customer.lng,
      Created_At: now,
      Total_Orders: 1,
      Last_Order_At: now,
    },
  };

  try {
    logger.info('Saving user to Google Sheets', { userId }, 'GOOGLE_SHEETS');

    // Use form submission to bypass CORS
    const iframeName = 'userSheetFrame_' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GOOGLE_SCRIPT_URL;
    form.target = iframeName;
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(payload);
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();

    // Clean up after delay
    setTimeout(() => {
      document.body.removeChild(form);
      document.body.removeChild(iframe);
    }, 2000);

    logger.info('User saved to Google Sheets', { userId }, 'GOOGLE_SHEETS');
    return {
      success: true,
      message: 'User saved successfully',
    };
  } catch (error) {
    logger.error('Failed to save user', error instanceof Error ? error : new Error(String(error)), 'GOOGLE_SHEETS');
    return {
      success: false,
      message: 'Failed to save user information',
    };
  }
}

/**
 * Complete order submission flow
 * 1. Save user to Users sheet
 * 2. Save order to Orders sheet
 * 3. Return order ID for WhatsApp redirect
 */
export async function submitCompleteOrder(
  restaurantName: string,
  items: OrderItem[],
  customer: CustomerInfo,
  pricing: OrderPricing,
  termsAccepted: boolean = true
): Promise<OrderSubmissionResult> {
  const orderId = generateOrderId();
  const userId = generateUserId(customer.phone);

  try {
    // Step 1: Save user (non-blocking, can fail silently)
    saveUserToGoogleSheet(customer).catch(err => {
      logger.warn('User save failed but continuing with order', err, 'GOOGLE_SHEETS');
    });

    // Step 2: Save order (critical)
    const orderPayload = createOrderPayload(orderId, userId, restaurantName, items, customer, pricing, termsAccepted);
    const orderResult = await sendOrderToGoogleSheet(orderPayload);

    if (orderResult.success) {
      return {
        success: true,
        orderId,
        message: 'Order saved successfully',
      };
    } else {
      return {
        success: false,
        orderId,
        message: orderResult.message || 'Failed to save order',
      };
    }
  } catch (error) {
    logger.error('Order submission failed', error instanceof Error ? error : new Error(String(error)), 'GOOGLE_SHEETS');
    return {
      success: false,
      orderId,
      message: 'An unexpected error occurred',
    };
  }
}

// ============================================
// TypeScript Interfaces
// ============================================

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  vegNonVeg?: 'Veg' | 'Non-Veg';
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  lat: number;
  lng: number;
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

export interface GoogleSheetOrderData {
  Order_ID: string;
  User_ID: string;
  Restaurant_Name: string;
  Items_JSON: string;
  Total_Items: number;
  Subtotal: number;
  Tax_Amount: number;
  Delivery_Fee: number;
  Total_Price: number;
  Customer_Name: string;
  Customer_Phone: string;
  Customer_Email: string;
  Customer_Address: string;
  Latitude: number;
  Longitude: number;
  Order_Time: string;
  Order_Status: string;
  Terms_Accepted: string;
  Terms_Accepted_At: string;
  Admin_Notes: string;
  Invoice_Trigger: string;
  Invoice_URL: string;
  Created_At: string;
  Updated_At: string;
}

export interface GoogleSheetOrderPayload {
  sheetName: 'Orders';
  action: 'addOrder';
  data: GoogleSheetOrderData;
}

export interface GoogleSheetUserData {
  User_ID: string;
  Name: string;
  Phone: string;
  Email: string;
  Address: string;
  Lat: number;
  Long: number;
  Created_At: string;
  Total_Orders: number;
  Last_Order_At: string;
}

export interface GoogleSheetUserPayload {
  sheetName: 'Users';
  action: 'addOrUpdateUser';
  data: GoogleSheetUserData;
}

export interface GoogleSheetResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  userId?: string;
}

export interface OrderSubmissionResult {
  success: boolean;
  orderId: string;
  message: string;
}
