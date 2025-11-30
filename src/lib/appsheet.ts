import type { Order, AppSheetOrder } from '../types';

// AppSheet API Configuration
const APPSHEET_CONFIG = {
  apiUrl: 'https://api.appsheet.com/api/v2/apps',
  appId: process.env.APPSHEET_APP_ID || 'YOUR_APP_ID',
  accessKey: process.env.APPSHEET_ACCESS_KEY || 'YOUR_ACCESS_KEY',
  mockMode: true // Set to false in production
};

/**
 * Log order to AppSheet (Google Sheets backend)
 * In mock mode, this just logs to console
 * In production, it sends data to AppSheet API
 */
export async function logOrderToAppSheet(order: Order): Promise<boolean> {
  try {
    // Convert order to AppSheet format
    const appSheetOrder: AppSheetOrder = {
      Order_ID: order.orderId,
      Restaurant_ID: order.restaurantId,
      Restaurant_Name: order.restaurantName,
      Items_JSON: JSON.stringify(order.items),
      Total_Items: order.items.reduce((sum, item) => sum + item.quantity, 0),
      Subtotal: order.subtotal,
      Tax_Amount: order.tax,
      Total_Price: order.total,
      Customer_Name: order.customer.name,
      Customer_Phone: order.customer.phone,
      Customer_Email: order.customer.email,
      Customer_Address: order.customer.address,
      Latitude: order.customer.latitude,
      Longitude: order.customer.longitude,
      Order_Time: order.orderTime,
      Order_Status: 'Pending',
      Invoice_Trigger: false
    };

    if (APPSHEET_CONFIG.mockMode) {
      // Mock mode - just log to console
      console.log('═══════════════════════════════════════════');
      console.log('📦 [MOCK] Order logged to AppSheet');
      console.log('═══════════════════════════════════════════');
      console.log('Order ID:', appSheetOrder.Order_ID);
      console.log('Restaurant:', appSheetOrder.Restaurant_Name);
      console.log('Customer:', appSheetOrder.Customer_Name);
      console.log('Total:', `₹${appSheetOrder.Total_Price}`);
      console.log('Items:', appSheetOrder.Total_Items);
      console.log('═══════════════════════════════════════════');
      console.log('✅ [MOCK] User profile updated');
      console.log('✅ [MOCK] Daily backup bot active');
      console.log('✅ [MOCK] Weekly sales summary scheduled');
      console.log('═══════════════════════════════════════════');
      return true;
    }

    // Production mode - send to AppSheet API
    const response = await fetch(
      `${APPSHEET_CONFIG.apiUrl}/${APPSHEET_CONFIG.appId}/tables/Orders/Action`,
      {
        method: 'POST',
        headers: {
          'ApplicationAccessKey': APPSHEET_CONFIG.accessKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Action: 'Add',
          Rows: [appSheetOrder]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`AppSheet API error: ${response.statusText}`);
    }

    console.log('✅ Order successfully logged to AppSheet');
    return true;

  } catch (error) {
    console.error('❌ Failed to log order to AppSheet:', error);
    return false;
  }
}

/**
 * Trigger invoice generation via AppSheet
 * Sets Invoice_Trigger to TRUE which activates the AppSheet bot
 */
export async function triggerInvoice(orderId: string): Promise<boolean> {
  try {
    if (APPSHEET_CONFIG.mockMode) {
      console.log('═══════════════════════════════════════════');
      console.log('📄 [MOCK] Invoice generation triggered');
      console.log('═══════════════════════════════════════════');
      console.log('Order ID:', orderId);
      console.log('✅ [MOCK] Invoice template filled');
      console.log('✅ [MOCK] PDF invoice generated');
      console.log('✅ [MOCK] Email sent via AppSheet bot');
      console.log('═══════════════════════════════════════════');
      return true;
    }

    // Production mode - update order to trigger invoice
    const response = await fetch(
      `${APPSHEET_CONFIG.apiUrl}/${APPSHEET_CONFIG.appId}/tables/Orders/Action`,
      {
        method: 'POST',
        headers: {
          'ApplicationAccessKey': APPSHEET_CONFIG.accessKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Action: 'Edit',
          Rows: [{
            Order_ID: orderId,
            Invoice_Trigger: true
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`AppSheet API error: ${response.statusText}`);
    }

    console.log('✅ Invoice generation triggered');
    return true;

  } catch (error) {
    console.error('❌ Failed to trigger invoice:', error);
    return false;
  }
}

/**
 * Update user profile in AppSheet
 * Increments order count and updates last order date
 */
export async function updateUserProfile(userId: string): Promise<boolean> {
  try {
    if (APPSHEET_CONFIG.mockMode) {
      console.log(`✅ [MOCK] User profile updated for ${userId}`);
      return true;
    }

    // Production mode - AppSheet bot handles this automatically
    // This is just a placeholder for manual updates if needed
    return true;

  } catch (error) {
    console.error('❌ Failed to update user profile:', error);
    return false;
  }
}
