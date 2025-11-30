import type { Order } from '../types';
import { KHAZAANA_WHATSAPP } from './googleSheets';

/**
 * Generate WhatsApp message URL for order
 * Opens WhatsApp with pre-filled message
 * Uses Khazaana's main WhatsApp number for all restaurants
 */
export function generateWhatsAppURL(order: Order, restaurantWhatsApp?: string): string {
  const message = formatOrderMessage(order);
  const encodedMessage = encodeURIComponent(message);
  
  // Use Khazaana's main number (already includes country code 91)
  const whatsappNumber = restaurantWhatsApp || KHAZAANA_WHATSAPP;
  
  // Remove any non-numeric characters
  const cleanPhone = whatsappNumber.replace(/\D/g, '');
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Format order details as WhatsApp message
 */
function formatOrderMessage(order: Order): string {
  const itemsList = order.items
    .map((item, index) => `${index + 1}. ${item.itemName} x${item.quantity} - Rs.${item.price * item.quantity}`)
    .join('\n');

  const deliveryFee = typeof order.deliveryFee === 'number'
    ? order.deliveryFee
    : Math.max(0, order.total - order.subtotal - order.tax);
  const deliveryFeeText = deliveryFee === 0 ? 'FREE' : `Rs.${deliveryFee}`;

  const locationLink = order.customer.latitude && order.customer.longitude
    ? `https://maps.google.com/?q=${order.customer.latitude},${order.customer.longitude}`
    : 'Not provided';

  return `*NEW ORDER - KHAZAANA*

*Order ID:* ${order.orderId}

*Restaurant:* ${order.restaurantName}

*Items Ordered:*
${itemsList}

*Payment Details:*
- Subtotal: Rs.${order.subtotal}
- Tax: Rs.${order.tax}
- Delivery Fee: ${deliveryFeeText}
- *Total: Rs.${order.total}*

*Customer Details:*
- Name: ${order.customer.name}
- Phone: ${order.customer.phone}${order.customer.email ? `\n- Email: ${order.customer.email}` : ''}
- Address: ${order.customer.address}

*Location:* ${locationLink}

*Order Time:* ${new Date(order.orderTime).toLocaleString('en-IN')}

---
Thank you for ordering with Khazaana!`;
}

/**
 * Open WhatsApp with order details
 */
export function sendOrderViaWhatsApp(order: Order, restaurantWhatsApp?: string): void {
  const url = generateWhatsAppURL(order, restaurantWhatsApp);
  
  if (typeof window !== 'undefined') {
    window.location.href = url; // Use location.href for better mobile support
  }
}

/**
 * Generate simplified WhatsApp URL from basic order info
 * Used after Google Sheets submission
 */
export function generateWhatsAppURLFromOrderData(
  orderId: string,
  restaurantName: string,
  items: Array<{name: string; qty: number; price: number; vegNonVeg?: string}>,
  customer: {name: string; phone: string; email?: string; address: string; lat?: number; lng?: number},
  pricing: {subtotal: number; tax: number; total: number}
): string {
  const itemsList = items
    .map((item, index) => {
      const vegLabel = item.vegNonVeg === 'Veg' ? '[VEG]' : item.vegNonVeg === 'Non-Veg' ? '[NON-VEG]' : '';
      return `${index + 1}. ${item.name} x${item.qty} = Rs.${item.qty * item.price} ${vegLabel}`;
    })
    .join('\n');

  const locationSection = customer.lat && customer.lng
    ? `\n*Location:* https://maps.google.com/?q=${customer.lat},${customer.lng}`
    : '';

  const deliveryFee = Math.max(0, pricing.total - pricing.subtotal - pricing.tax);
  const deliveryFeeText = deliveryFee === 0 ? 'FREE' : `Rs.${deliveryFee}`;

  const orderTime = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });

  const message = `*NEW ORDER - KHAZAANA*

*Order ID:* ${orderId}
*Restaurant:* ${restaurantName}

*Items Ordered:*
${itemsList}

*Payment Details:*
- Subtotal: Rs.${pricing.subtotal}
- Tax: Rs.${pricing.tax}
- Delivery Fee: ${deliveryFeeText}
- *Total: Rs.${pricing.total}*

*Customer Details:*
- Name: ${customer.name}
- Phone: ${customer.phone}${customer.email ? `\n- Email: ${customer.email}` : ''}

*Delivery Address:*
${customer.address}${locationSection}

*Order Time:* ${orderTime}

---
Thank you for ordering with Khazaana!`;

  const encodedMessage = encodeURIComponent(message);
  const cleanPhone = KHAZAANA_WHATSAPP.replace(/\D/g, '');
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
