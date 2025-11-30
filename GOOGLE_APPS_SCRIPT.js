/**
 * Google Apps Script for Khazaana Food Ordering Backend
 * Deploy as Web App: Execute as "Me", Access "Anyone"
 * 
 * Handles:
 * - Users sheet
 * - Orders sheet  
 * - Invoices sheet
 * - Sales sheet
 * - PDF Invoice Generation with Drive storage
 * 
 * SETUP REQUIRED:
 * 1. Create a Google Drive folder for invoices and copy its ID
 * 2. Update INVOICE_FOLDER_ID below with your folder ID
 * 3. Deploy as Web App with "Execute as: Me" and "Who has access: Anyone"
 */

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const INVOICE_FOLDER_ID = '1BuLh_2RyTYp3703Gl5HbdLLX5S-pk9di'; // Khazaana Invoices folder
const COMPANY_NAME = 'Khazaana';
const COMPANY_ADDRESS = 'College More, near DNC College, Aurangabad, Suti, West Bengal 742201';
const COMPANY_PHONE = '+91 8695902696';
const COMPANY_EMAIL = 'helpkhazaana@gmail.com';
const COMPANY_WEBSITE = 'khazaana.co.in';
const COMPANY_LOGO_URL = 'https://khazaana.co.in/images/logo.png';

// ============================================
// MAIN POST HANDLER
// ============================================
function doPost(e) {
  try {
    // Handle both JSON body and form data
    let body;
    if (e.parameter && e.parameter.payload) {
      // Form submission (from iframe method)
      body = JSON.parse(e.parameter.payload);
    } else if (e.postData && e.postData.contents) {
      // Direct JSON POST
      body = JSON.parse(e.postData.contents);
    } else {
      throw new Error('No data received');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Route based on action
    if (body.action === 'addOrder') {
      return handleAddOrder(ss, body);
    } else if (body.action === 'addOrUpdateUser') {
      return handleAddUser(ss, body);
    } else {
      // Legacy format support (simple order)
      return handleLegacyOrder(ss, body);
    }
    
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// ORDER HANDLING
// ============================================
/**
 * Handle new order - matches Orders sheet columns exactly
 * Columns: Order_ID | User_ID | Restaurant_Name | Items_JSON | Total_Items | Subtotal | Tax_Amount | Delivery_Fee | Total_Price | Customer_Name | Customer_Phone | Customer_Email | Customer_Address | Latitude | Longitude | Order_Time | Order_Status | Terms_Accepted | Terms_Accepted_At | Admin_Notes | Invoice_Trigger | Invoice_URL | Created_At | Updated_At
 */
function handleAddOrder(ss, body) {
  const sheet = ss.getSheetByName('Orders');
  const data = body.data;
  
  const row = [
    data.Order_ID,
    data.User_ID,
    data.Restaurant_Name,
    data.Items_JSON,
    data.Total_Items,
    data.Subtotal,
    data.Tax_Amount,
    data.Delivery_Fee || 0,
    data.Total_Price,
    data.Customer_Name,
    data.Customer_Phone,
    data.Customer_Email || '',
    data.Customer_Address,
    data.Latitude,
    data.Longitude,
    data.Order_Time,
    data.Order_Status || 'Pending',
    data.Terms_Accepted || 'Yes',
    data.Terms_Accepted_At || data.Order_Time,
    data.Admin_Notes || '',
    data.Invoice_Trigger || 'No',
    data.Invoice_URL || '',
    data.Created_At,
    data.Updated_At
  ];
  
  sheet.appendRow(row);
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, orderId: data.Order_ID }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// USER HANDLING
// ============================================
/**
 * Handle user creation/update - matches Users sheet columns exactly
 * Columns: User_ID | Name | Phone | Email | Address | Lat | Long | Created_At | Total_Orders | Last_Order_At
 */
function handleAddUser(ss, body) {
  const sheet = ss.getSheetByName('Users');
  const data = body.data;
  
  // Check if user already exists
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  let existingRow = -1;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.User_ID) {
      existingRow = i + 1; // 1-indexed
      break;
    }
  }
  
  if (existingRow > 0) {
    // Update existing user - increment Total_Orders and update Last_Order_At
    const currentOrders = sheet.getRange(existingRow, 9).getValue() || 0;
    sheet.getRange(existingRow, 9).setValue(currentOrders + 1); // Total_Orders
    sheet.getRange(existingRow, 10).setValue(data.Last_Order_At); // Last_Order_At
    // Update address if changed
    sheet.getRange(existingRow, 5).setValue(data.Address);
    sheet.getRange(existingRow, 6).setValue(data.Lat);
    sheet.getRange(existingRow, 7).setValue(data.Long);
  } else {
    // Add new user
    const row = [
      data.User_ID,
      data.Name,
      data.Phone,
      data.Email || '',
      data.Address,
      data.Lat,
      data.Long,
      data.Created_At,
      data.Total_Orders || 1,
      data.Last_Order_At
    ];
    sheet.appendRow(row);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, userId: data.User_ID }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// INVOICE GENERATION (Triggered by Admin)
// ============================================
/**
 * INVOICE TRIGGER OPTIONS:
 * - "Yes" = Generate invoice and send email (if email exists)
 * - "Generate Only" = Generate invoice PDF but DON'T send email
 * - "Resend" = Regenerate invoice (for edited orders) and send email
 * - "No" = Do nothing
 * 
 * WORKFLOW:
 * 1. Order comes in → Invoice_Trigger = "No"
 * 2. Admin reviews order, makes any edits to Items_JSON, prices, etc.
 * 3. Admin sets Invoice_Trigger to "Yes" or "Generate Only"
 * 4. If order changes later, admin can set to "Resend" to regenerate
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  // Only process Orders sheet
  if (sheet.getName() !== 'Orders') return;
  
  // Check if Invoice_Trigger column (column 21) was changed
  const invoiceTriggerCol = 21; // Column U
  if (range.getColumn() === invoiceTriggerCol) {
    const row = range.getRow();
    const triggerValue = e.value;
    
    // Skip if already processed or empty
    if (!triggerValue || triggerValue === 'No' || triggerValue === 'Generated' || triggerValue === 'Done' || triggerValue === 'Failed') {
      return;
    }
    
    // Check if invoice already exists for this order (prevent duplicates)
    const existingUrl = sheet.getRange(row, 22).getValue(); // Invoice_URL column
    if (existingUrl && triggerValue === 'Yes') {
      // Invoice already exists, change to Resend if you want to regenerate
      sheet.getRange(row, 20).setValue('Invoice already exists. Use "Resend" to regenerate.'); // Admin_Notes
      sheet.getRange(row, 21).setValue('Generated');
      return;
    }
    
    if (triggerValue === 'Yes' || triggerValue === 'Resend') {
      // Generate and send email
      generateInvoiceForRow(sheet, row, true);
    } else if (triggerValue === 'Generate Only') {
      // Generate PDF only, no email
      generateInvoiceForRow(sheet, row, false);
    }
  }
}

/**
 * Generate PDF invoice for a specific order row
 * @param {Sheet} sheet - The Orders sheet
 * @param {number} row - Row number
 * @param {boolean} sendEmail - Whether to send email to customer
 */
function generateInvoiceForRow(sheet, row, sendEmail = true) {
  try {
    // Get order data
    const data = sheet.getRange(row, 1, 1, 24).getValues()[0];
    
    const orderData = {
      orderId: data[0],
      userId: data[1],
      restaurantName: data[2],
      itemsJson: data[3],
      totalItems: data[4],
      subtotal: data[5],
      taxAmount: data[6],
      deliveryFee: data[7],
      totalPrice: data[8],
      customerName: data[9],
      customerPhone: data[10],
      customerEmail: data[11],
      customerAddress: data[12],
      latitude: data[13],
      longitude: data[14],
      orderTime: data[15],
      orderStatus: data[16],
      termsAccepted: data[17],
      termsAcceptedAt: data[18]
    };
    
    // Generate PDF
    const pdfBlob = createInvoicePDF(orderData);
    
    // Save to Drive - try folder first, fallback to root
    let file;
    let invoiceUrl;
    try {
      const folder = DriveApp.getFolderById(INVOICE_FOLDER_ID);
      file = folder.createFile(pdfBlob);
      invoiceUrl = file.getUrl();
    } catch (driveError) {
      // Fallback: Save to spreadsheet's parent folder or root
      Logger.log('Drive folder access failed, saving to root: ' + driveError.toString());
      file = DriveApp.createFile(pdfBlob);
      invoiceUrl = file.getUrl();
    }
    
    // Update sheet with invoice URL and clear any old errors
    sheet.getRange(row, 22).setValue(invoiceUrl); // Invoice_URL column
    sheet.getRange(row, 24).setValue(formatISTDateTime(new Date())); // Updated_At in IST
    sheet.getRange(row, 20).setValue('Invoice generated successfully'); // Clear Admin_Notes
    
    // Log to Invoices sheet
    logInvoice(orderData.orderId, invoiceUrl, orderData.customerEmail, pdfBlob.getBytes().length, sendEmail);
    
    // Send email only if sendEmail is true AND customer provided email
    if (sendEmail && orderData.customerEmail && orderData.customerEmail.trim() !== '') {
      sendInvoiceEmail(orderData, pdfBlob, invoiceUrl);
      // Update email status in Invoices sheet
      updateInvoiceEmailStatus(orderData.orderId, 'Sent');
      sheet.getRange(row, 20).setValue('Invoice generated & emailed successfully'); // Admin_Notes
    } else if (!sendEmail) {
      // Mark as not sent (admin chose Generate Only)
      updateInvoiceEmailStatus(orderData.orderId, 'Not Sent (Admin)');
    }
    
    // Reset trigger to "Generated" to prevent re-triggering
    sheet.getRange(row, 21).setValue('Generated');
    
  } catch (error) {
    Logger.log('Error generating invoice: ' + error.toString());
    // Mark as failed
    sheet.getRange(row, 20).setValue('Invoice generation failed: ' + error.toString()); // Admin_Notes
    sheet.getRange(row, 21).setValue('Failed'); // Mark as failed
  }
}

/**
 * Format date to IST with AM/PM
 * @param {Date} date - Date object
 * @returns {string} Formatted date string like "2025-11-30 9:43 AM"
 */
function formatISTDateTime(date) {
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
 * Create beautiful PDF invoice
 */
function createInvoicePDF(orderData) {
  // Safely parse items - handle undefined, null, empty string, or already parsed array
  let items = [];
  try {
    if (orderData.itemsJson) {
      if (typeof orderData.itemsJson === 'string') {
        items = JSON.parse(orderData.itemsJson);
      } else if (Array.isArray(orderData.itemsJson)) {
        items = orderData.itemsJson;
      }
    }
  } catch (e) {
    Logger.log('Error parsing items JSON: ' + e.message);
    items = [];
  }
  
  // Ensure items is an array
  if (!Array.isArray(items)) {
    items = [];
  }
  
  // Build HTML for invoice
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; }
        .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
        
        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #f97316; }
        .logo { font-size: 36px; font-weight: bold; color: #f97316; }
        .logo-sub { font-size: 14px; color: #666; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 28px; color: #333; margin-bottom: 5px; }
        .invoice-number { font-size: 14px; color: #666; }
        
        /* Info sections */
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-box { width: 48%; }
        .info-box h3 { font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 10px; letter-spacing: 1px; }
        .info-box p { font-size: 14px; margin-bottom: 5px; }
        .info-box .highlight { color: #f97316; font-weight: 600; }
        
        /* Order details */
        .order-meta { background: #f8f9fa; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px; }
        .order-meta-row { display: flex; justify-content: space-between; }
        .order-meta-item { text-align: center; }
        .order-meta-label { font-size: 11px; text-transform: uppercase; color: #999; }
        .order-meta-value { font-size: 14px; font-weight: 600; color: #333; }
        
        /* Items table */
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #f97316; color: white; padding: 12px 15px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .items-table th:first-child { border-radius: 8px 0 0 0; }
        .items-table th:last-child { border-radius: 0 8px 0 0; text-align: right; }
        .items-table td { padding: 15px; border-bottom: 1px solid #eee; font-size: 14px; }
        .items-table td:last-child { text-align: right; font-weight: 600; }
        .items-table tr:last-child td { border-bottom: none; }
        .item-name { font-weight: 600; }
        .item-type { font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
        .item-type.veg { background: #dcfce7; color: #166534; }
        .item-type.nonveg { background: #fee2e2; color: #991b1b; }
        
        /* Totals */
        .totals { margin-left: auto; width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .totals-row.subtotal { border-top: 1px solid #eee; padding-top: 15px; }
        .totals-row.total { border-top: 2px solid #333; padding-top: 15px; margin-top: 10px; font-size: 18px; font-weight: bold; }
        .totals-row.total .amount { color: #f97316; }
        
        /* Footer */
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; }
        .footer p { font-size: 12px; color: #999; margin-bottom: 5px; }
        .footer .thank-you { font-size: 16px; color: #f97316; font-weight: 600; margin-bottom: 15px; }
        
        /* Terms */
        .terms { margin-top: 30px; padding: 15px; background: #fff8f0; border-radius: 8px; border-left: 4px solid #f97316; }
        .terms h4 { font-size: 12px; text-transform: uppercase; color: #f97316; margin-bottom: 8px; }
        .terms p { font-size: 11px; color: #666; }
      </style>
    </head>
    <body>
      <div class="invoice">
        <!-- Header -->
        <div class="header">
          <div>
            <img src="${COMPANY_LOGO_URL}" alt="Khazaana Logo" style="height: 50px; margin-bottom: 8px;" onerror="this.style.display='none'" />
            <div class="logo">${COMPANY_NAME}</div>
            <div class="logo-sub">Food Ordering Platform</div>
          </div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <div class="invoice-number">${orderData.orderId}</div>
          </div>
        </div>
        
        <!-- Info Section -->
        <div class="info-section">
          <div class="info-box">
            <h3>Bill To</h3>
            <p><strong>${orderData.customerName}</strong></p>
            <p>${orderData.customerPhone}</p>
            ${orderData.customerEmail ? `<p>${orderData.customerEmail}</p>` : ''}
            <p>${orderData.customerAddress}</p>
          </div>
          <div class="info-box">
            <h3>From</h3>
            <p><strong>${COMPANY_NAME}</strong></p>
            <p>${COMPANY_ADDRESS}</p>
            <p>${COMPANY_PHONE}</p>
            <p>${COMPANY_EMAIL}</p>
          </div>
        </div>
        
        <!-- Order Meta -->
        <div class="order-meta">
          <div class="order-meta-row">
            <div class="order-meta-item">
              <div class="order-meta-label">Order Date</div>
              <div class="order-meta-value">${formatDate(orderData.orderTime)}</div>
            </div>
            <div class="order-meta-item">
              <div class="order-meta-label">Restaurant</div>
              <div class="order-meta-value">${orderData.restaurantName}</div>
            </div>
            <div class="order-meta-item">
              <div class="order-meta-label">Status</div>
              <div class="order-meta-value">${orderData.orderStatus}</div>
            </div>
            <div class="order-meta-item">
              <div class="order-meta-label">Payment</div>
              <div class="order-meta-value">Cash on Delivery</div>
            </div>
          </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
              const itemName = item.name || item.itemName || 'Item';
              const itemQty = item.qty || item.quantity || 1;
              const itemPrice = parseFloat(item.price) || 0;
              const vegType = item.vegNonVeg || '';
              return `
              <tr>
                <td>
                  <span class="item-name">${itemName}</span>
                  ${vegType ? `<span class="item-type ${vegType === 'Veg' ? 'veg' : 'nonveg'}">${vegType}</span>` : ''}
                </td>
                <td>${itemQty}</td>
                <td>₹${itemPrice.toFixed(2)}</td>
                <td>₹${(itemQty * itemPrice).toFixed(2)}</td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals">
          <div class="totals-row subtotal">
            <span>Subtotal</span>
            <span>₹${parseFloat(orderData.subtotal).toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Tax</span>
            <span>₹${parseFloat(orderData.taxAmount).toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Delivery Fee</span>
            <span>${parseFloat(orderData.deliveryFee) === 0 ? 'FREE' : '₹' + parseFloat(orderData.deliveryFee).toFixed(2)}</span>
          </div>
          <div class="totals-row total">
            <span>Total</span>
            <span class="amount">₹${parseFloat(orderData.totalPrice).toFixed(2)}</span>
          </div>
        </div>
        
        <!-- Terms -->
        <div class="terms">
          <h4>Terms & Conditions Accepted</h4>
          <p>Customer accepted terms on ${formatDate(orderData.termsAcceptedAt)}. Food quality is the responsibility of ${orderData.restaurantName}. Khazaana is a platform connecting customers with restaurants.</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p class="thank-you">Thank you for ordering with Khazaana! 🙏</p>
          <p>${COMPANY_WEBSITE} | ${COMPANY_PHONE}</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Convert HTML to PDF
  const blob = Utilities.newBlob(html, 'text/html', 'invoice.html');
  const pdf = blob.getAs('application/pdf');
  pdf.setName(`Invoice_${orderData.orderId}.pdf`);
  
  return pdf;
}

/**
 * Log invoice to Invoices sheet
 * Columns: Invoice_ID | Order_ID | Invoice_URL | Generated_At | Sent_To_Email | Email_Status | PDF_Size
 */
function logInvoice(orderId, invoiceUrl, email, pdfSize, willSendEmail = true) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Invoices');
  
  const invoiceId = 'INV-' + new Date().getTime();
  const now = new Date().toISOString().replace('T', ' ').split('.')[0];
  
  // Determine initial email status
  let emailStatus = 'N/A';
  if (email && email.trim() !== '') {
    emailStatus = willSendEmail ? 'Pending' : 'Not Sent (Admin)';
  }
  
  const row = [
    invoiceId,
    orderId,
    invoiceUrl,
    now,
    email || '',
    emailStatus,
    Math.round(pdfSize / 1024) + ' KB'
  ];
  
  sheet.appendRow(row);
}

/**
 * Update invoice email status
 */
function updateInvoiceEmailStatus(orderId, status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Invoices');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === orderId) {
      sheet.getRange(i + 1, 6).setValue(status);
      break;
    }
  }
}

/**
 * Send invoice email to customer
 */
function sendInvoiceEmail(orderData, pdfBlob, invoiceUrl) {
  const customerName = orderData.customerName || 'Customer';
  const orderId = orderData.orderId || 'N/A';
  const restaurantName = orderData.restaurantName || 'Restaurant';
  const totalPrice = parseFloat(orderData.totalPrice || 0).toFixed(2);
  
  const subject = 'Your Khazaana Order Invoice - ' + orderId;
  
  const htmlBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">' +
    '<div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">' +
      '<img src="' + COMPANY_LOGO_URL + '" alt="Khazaana" style="height: 40px; margin-bottom: 10px;" />' +
      '<h1 style="color: white; margin: 0;">Khazaana</h1>' +
      '<p style="color: #fed7aa; margin: 10px 0 0 0;">Your Order Invoice</p>' +
    '</div>' +
    
    '<div style="padding: 30px; background: #fff;">' +
      '<p>Dear <strong>' + customerName + '</strong>,</p>' +
      
      '<p>Thank you for your order! Please find your invoice attached to this email.</p>' +
      
      '<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
        '<p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> ' + orderId + '</p>' +
        '<p style="margin: 0 0 10px 0;"><strong>Restaurant:</strong> ' + restaurantName + '</p>' +
        '<p style="margin: 0 0 10px 0;"><strong>Total Amount:</strong> ₹' + totalPrice + '</p>' +
        '<p style="margin: 0;"><strong>Payment:</strong> Cash on Delivery</p>' +
      '</div>' +
      
      '<p>You can also <a href="' + invoiceUrl + '" style="color: #f97316;">view your invoice online</a>.</p>' +
      
      '<p>If you have any questions, feel free to contact us on WhatsApp at ' + COMPANY_PHONE + '.</p>' +
      
      '<p style="margin-top: 30px;">' +
        'Best regards,<br>' +
        '<strong>Team Khazaana</strong>' +
      '</p>' +
    '</div>' +
    
    '<div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px;">' +
      '<p style="margin: 0 0 10px 0;">' + COMPANY_ADDRESS + '</p>' +
      '<p style="margin: 0;">' + COMPANY_PHONE + ' | ' + COMPANY_EMAIL + '</p>' +
    '</div>' +
  '</div>';
  
  MailApp.sendEmail({
    to: orderData.customerEmail,
    subject: subject,
    htmlBody: htmlBody,
    attachments: [pdfBlob],
    name: 'Khazaana'
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Legacy order format (backward compatibility)
 */
function handleLegacyOrder(ss, body) {
  const sheet = ss.getSheetByName('Orders');
  const orderId = 'ORD-' + new Date().getTime();
  const now = new Date().toISOString().replace('T', ' ').split('.')[0];
  
  const row = [
    orderId,
    'USR-' + body.userPhone,
    body.restaurantName || 'Unknown',
    JSON.stringify(body.items),
    body.items ? body.items.length : 0,
    body.subtotal || body.total,
    body.tax || 0,
    body.deliveryFee || 0,
    body.total,
    body.userName || '',
    body.userPhone,
    body.userEmail || '',
    body.address,
    body.lat,
    body.lng,
    now,
    'Pending',
    'Yes',
    now,
    '',
    'No',
    '',
    now,
    now
  ];
  
  sheet.appendRow(row);
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, orderId: orderId }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle OPTIONS for CORS preflight (if needed)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Khazaana API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// MANUAL INVOICE GENERATION (for testing)
// ============================================
/**
 * Generate invoice for a specific order ID
 * Run this function manually from the script editor
 */
function generateInvoiceManually() {
  const orderId = 'ORD-20241129-12345'; // Change this to your order ID
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      generateInvoiceForRow(sheet, i + 1);
      Logger.log('Invoice generated for ' + orderId);
      return;
    }
  }
  
  Logger.log('Order not found: ' + orderId);
}

// ============================================
// DAILY BACKUP (Triggered by Time-based Trigger)
// ============================================
/**
 * Backup Orders sheet daily to a separate backup sheet
 * SET UP: Create a time-based trigger to run this daily at midnight
 * 
 * To set up trigger:
 * 1. Go to Triggers (clock icon) in Apps Script
 * 2. Add Trigger → dailyBackup → Time-driven → Day timer → Midnight
 */
function dailyBackup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName('Orders');
  
  if (!ordersSheet) {
    Logger.log('Orders sheet not found');
    return;
  }
  
  // Create or get backup sheet
  const backupDate = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  const backupSheetName = 'Backup_' + backupDate;
  
  // Check if backup already exists for today
  let backupSheet = ss.getSheetByName(backupSheetName);
  if (backupSheet) {
    Logger.log('Backup already exists for today: ' + backupSheetName);
    return;
  }
  
  // Copy Orders sheet as backup
  backupSheet = ordersSheet.copyTo(ss);
  backupSheet.setName(backupSheetName);
  
  // Move backup sheet to end
  ss.setActiveSheet(backupSheet);
  ss.moveActiveSheet(ss.getNumSheets());
  
  // Log backup
  Logger.log('Daily backup created: ' + backupSheetName);
  
  // Clean up old backups (keep last 30 days)
  cleanOldBackups(ss, 30);
}

/**
 * Clean up backups older than specified days
 */
function cleanOldBackups(ss, keepDays) {
  const sheets = ss.getSheets();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - keepDays);
  
  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name.startsWith('Backup_')) {
      const dateStr = name.replace('Backup_', '');
      const backupDate = new Date(dateStr);
      
      if (backupDate < cutoffDate) {
        ss.deleteSheet(sheet);
        Logger.log('Deleted old backup: ' + name);
      }
    }
  });
}

// ============================================
// WEEKLY SALES SUMMARY (Triggered by Time-based Trigger)
// ============================================
/**
 * Generate weekly sales summary every Sunday at 11 PM
 * 
 * SET UP: Create a time-based trigger
 * 1. Go to Triggers (clock icon) in Apps Script
 * 2. Add Trigger → weeklySalesSummary → Time-driven → Week timer → Sunday, 11pm-midnight
 */
function weeklySalesSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName('Orders');
  
  if (!ordersSheet) {
    Logger.log('Orders sheet not found');
    return;
  }
  
  // Get or create Weekly_Sales sheet
  let salesSheet = ss.getSheetByName('Weekly_Sales');
  if (!salesSheet) {
    salesSheet = ss.insertSheet('Weekly_Sales');
    // Add headers
    salesSheet.getRange(1, 1, 1, 10).setValues([[
      'Week_Start', 'Week_End', 'Total_Orders', 'Total_Revenue', 'Total_Tax', 
      'Total_Delivery_Fees', 'Avg_Order_Value', 'Top_Restaurant', 
      'Top_Restaurant_Orders', 'Generated_At'
    ]]);
    salesSheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  }
  
  // Calculate week range (last 7 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  // Get all orders
  const ordersData = ordersSheet.getDataRange().getValues();
  const headers = ordersData[0];
  
  // Find column indices
  const orderTimeCol = headers.indexOf('Order_Time');
  const totalPriceCol = headers.indexOf('Total_Price');
  const taxCol = headers.indexOf('Tax_Amount');
  const deliveryFeeCol = headers.indexOf('Delivery_Fee');
  const restaurantCol = headers.indexOf('Restaurant_Name');
  const statusCol = headers.indexOf('Order_Status');
  
  // Filter orders from last week
  const weekOrders = [];
  const restaurantCounts = {};
  
  for (let i = 1; i < ordersData.length; i++) {
    const row = ordersData[i];
    const orderTime = new Date(row[orderTimeCol]);
    
    if (orderTime >= startDate && orderTime <= endDate) {
      weekOrders.push(row);
      
      // Count by restaurant
      const restaurant = row[restaurantCol];
      restaurantCounts[restaurant] = (restaurantCounts[restaurant] || 0) + 1;
    }
  }
  
  // Calculate totals
  const totalOrders = weekOrders.length;
  let totalRevenue = 0;
  let totalTax = 0;
  let totalDeliveryFees = 0;
  
  weekOrders.forEach(order => {
    totalRevenue += parseFloat(order[totalPriceCol]) || 0;
    totalTax += parseFloat(order[taxCol]) || 0;
    totalDeliveryFees += parseFloat(order[deliveryFeeCol]) || 0;
  });
  
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;
  
  // Find top restaurant
  let topRestaurant = 'N/A';
  let topRestaurantOrders = 0;
  for (const [restaurant, count] of Object.entries(restaurantCounts)) {
    if (count > topRestaurantOrders) {
      topRestaurant = restaurant;
      topRestaurantOrders = count;
    }
  }
  
  // Format dates
  const formatDate = (date) => Utilities.formatDate(date, 'Asia/Kolkata', 'yyyy-MM-dd');
  const now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
  
  // Add summary row
  const summaryRow = [
    formatDate(startDate),
    formatDate(endDate),
    totalOrders,
    totalRevenue.toFixed(2),
    totalTax.toFixed(2),
    totalDeliveryFees.toFixed(2),
    avgOrderValue,
    topRestaurant,
    topRestaurantOrders,
    now
  ];
  
  salesSheet.appendRow(summaryRow);
  
  Logger.log('Weekly sales summary generated: ' + totalOrders + ' orders, Rs.' + totalRevenue.toFixed(2) + ' revenue');
}

/**
 * Run this manually to generate sales summary for testing
 */
function generateSalesSummaryManually() {
  weeklySalesSummary();
}

// ============================================
// AUTHORIZATION HELPER
// ============================================

/**
 * RUN THIS FIRST! Requests all required permissions at once.
 * After running, click "Review Permissions" and allow all.
 */
function requestAllPermissions() {
  try {
    // 1. Spreadsheet access
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('✓ Spreadsheet access: ' + ss.getName());
    
    // 2. Drive access - create and delete test file
    const testFile = DriveApp.createFile('khazaana_permission_test.txt', 'Test file - safe to delete');
    Logger.log('✓ Drive access granted. Test file: ' + testFile.getUrl());
    testFile.setTrashed(true); // Delete test file
    
    // 3. Try folder access
    try {
      const folder = DriveApp.getFolderById(INVOICE_FOLDER_ID);
      Logger.log('✓ Invoice folder access: ' + folder.getName());
    } catch (folderError) {
      Logger.log('⚠ Invoice folder not accessible. Check INVOICE_FOLDER_ID or folder permissions.');
    }
    
    // 4. Gmail access
    const quota = MailApp.getRemainingDailyQuota();
    Logger.log('✓ Email access granted. Daily quota: ' + quota);
    
    // 5. Script triggers access
    const triggers = ScriptApp.getProjectTriggers();
    Logger.log('✓ Script triggers access. Current triggers: ' + triggers.length);
    
    Logger.log('');
    Logger.log('========================================');
    Logger.log('ALL PERMISSIONS GRANTED SUCCESSFULLY!');
    Logger.log('You can now use invoice generation.');
    Logger.log('========================================');
    
    return { success: true, message: 'All permissions granted' };
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
    Logger.log('Please click "Review Permissions" when prompted and allow all access.');
    return { success: false, error: error.message };
  }
}

/**
 * STEP 1: Run this function FIRST to grant Drive folder access
 * This creates a test file in your invoice folder to trigger permissions
 */
function grantDriveAccess() {
  // Access the specific folder - this triggers permission request
  const folder = DriveApp.getFolderById(INVOICE_FOLDER_ID);
  
  // Create a test file to confirm access
  const testFile = folder.createFile('test_permission.txt', 'Permission test - you can delete this file');
  Logger.log('SUCCESS! Drive folder access granted.');
  Logger.log('Test file created: ' + testFile.getUrl());
  Logger.log('You can delete the test file from your Drive folder.');
}

/**
 * STEP 2: Run this to test email permissions
 */
function grantEmailAccess() {
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log('SUCCESS! Email access granted. Daily quota remaining: ' + quota);
}

// ============================================
// ANALYTICS DASHBOARD
// ============================================
/**
 * Create or update Analytics Dashboard
 * Run this manually or set up a daily trigger
 * 
 * Creates charts for:
 * - Revenue over time
 * - Orders by restaurant
 * - Popular items
 * - Peak ordering hours
 * - Customer insights
 */
function generateAnalyticsDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName('Orders');
  
  if (!ordersSheet) {
    Logger.log('Orders sheet not found');
    return;
  }
  
  // Get or create Analytics sheet
  let analyticsSheet = ss.getSheetByName('Analytics');
  if (analyticsSheet) {
    // Clear existing content but keep the sheet
    analyticsSheet.clear();
    // Remove existing charts
    const charts = analyticsSheet.getCharts();
    charts.forEach(chart => analyticsSheet.removeChart(chart));
  } else {
    analyticsSheet = ss.insertSheet('Analytics');
  }
  
  // Get orders data
  const ordersData = ordersSheet.getDataRange().getValues();
  if (ordersData.length < 2) {
    analyticsSheet.getRange('A1').setValue('No orders data available yet.');
    return;
  }
  
  const headers = ordersData[0];
  const orders = ordersData.slice(1);
  
  // Find column indices
  const cols = {
    orderId: headers.indexOf('Order_ID'),
    restaurant: headers.indexOf('Restaurant_Name'),
    itemsJson: headers.indexOf('Items_JSON'),
    totalItems: headers.indexOf('Total_Items'),
    subtotal: headers.indexOf('Subtotal'),
    tax: headers.indexOf('Tax_Amount'),
    deliveryFee: headers.indexOf('Delivery_Fee'),
    totalPrice: headers.indexOf('Total_Price'),
    customerName: headers.indexOf('Customer_Name'),
    orderTime: headers.indexOf('Order_Time'),
    status: headers.indexOf('Order_Status')
  };
  
  // ========== SUMMARY METRICS ==========
  analyticsSheet.getRange('A1').setValue('KHAZAANA ANALYTICS DASHBOARD');
  analyticsSheet.getRange('A1').setFontSize(18).setFontWeight('bold').setFontColor('#f97316');
  analyticsSheet.getRange('A2').setValue('Last updated: ' + new Date().toLocaleString('en-IN'));
  analyticsSheet.getRange('A2').setFontColor('#666666');
  
  // Calculate key metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o[cols.totalPrice]) || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalCustomers = [...new Set(orders.map(o => o[cols.customerName]))].length;
  
  // Summary cards
  analyticsSheet.getRange(4, 1, 1, 2).setValues([['Total Orders', totalOrders]]);
  analyticsSheet.getRange(4, 3, 1, 2).setValues([['Total Revenue', 'Rs. ' + totalRevenue.toFixed(2)]]);
  analyticsSheet.getRange(4, 5, 1, 2).setValues([['Avg Order Value', 'Rs. ' + avgOrderValue.toFixed(2)]]);
  analyticsSheet.getRange(4, 7, 1, 2).setValues([['Total Customers', totalCustomers]]);
  
  analyticsSheet.getRange(4, 1, 1, 8).setBackground('#fff7ed').setFontWeight('bold');
  analyticsSheet.getRange(4, 2).setFontColor('#f97316').setFontSize(14);
  analyticsSheet.getRange(4, 4).setFontColor('#f97316').setFontSize(14);
  analyticsSheet.getRange(4, 6).setFontColor('#f97316').setFontSize(14);
  analyticsSheet.getRange(4, 8).setFontColor('#f97316').setFontSize(14);
  
  // ========== RESTAURANT ANALYTICS ==========
  analyticsSheet.getRange('A7').setValue('ORDERS BY RESTAURANT');
  analyticsSheet.getRange('A7').setFontSize(12).setFontWeight('bold');
  
  const restaurantStats = {};
  orders.forEach(order => {
    const restaurant = order[cols.restaurant] || 'Unknown';
    if (!restaurantStats[restaurant]) {
      restaurantStats[restaurant] = { orders: 0, revenue: 0 };
    }
    restaurantStats[restaurant].orders++;
    restaurantStats[restaurant].revenue += parseFloat(order[cols.totalPrice]) || 0;
  });
  
  const restaurantData = [['Restaurant', 'Orders', 'Revenue']];
  Object.entries(restaurantStats)
    .sort((a, b) => b[1].orders - a[1].orders)
    .forEach(([name, stats]) => {
      restaurantData.push([name, stats.orders, stats.revenue.toFixed(2)]);
    });
  
  analyticsSheet.getRange(8, 1, restaurantData.length, 3).setValues(restaurantData);
  analyticsSheet.getRange('A8:C8').setBackground('#fed7aa').setFontWeight('bold');
  
  // Restaurant Orders Chart
  if (restaurantData.length > 1) {
    const restaurantChartRange = analyticsSheet.getRange(8, 1, restaurantData.length, 2);
    const restaurantChart = analyticsSheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(restaurantChartRange)
      .setPosition(7, 5, 0, 0)
      .setOption('title', 'Orders by Restaurant')
      .setOption('pieHole', 0.4)
      .setOption('colors', ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'])
      .setOption('width', 400)
      .setOption('height', 250)
      .build();
    analyticsSheet.insertChart(restaurantChart);
  }
  
  // ========== POPULAR ITEMS ==========
  const itemStats = {};
  orders.forEach(order => {
    try {
      const items = JSON.parse(order[cols.itemsJson] || '[]');
      items.forEach(item => {
        const name = item.name || item.itemName || 'Unknown';
        if (!itemStats[name]) {
          itemStats[name] = { qty: 0, revenue: 0 };
        }
        itemStats[name].qty += item.qty || item.quantity || 1;
        itemStats[name].revenue += (item.qty || item.quantity || 1) * (item.price || 0);
      });
    } catch (e) {}
  });
  
  const startRow = 8 + restaurantData.length + 2;
  analyticsSheet.getRange(startRow, 1).setValue('TOP 10 POPULAR ITEMS');
  analyticsSheet.getRange(startRow, 1).setFontSize(12).setFontWeight('bold');
  
  const itemData = [['Item Name', 'Quantity Sold', 'Revenue']];
  Object.entries(itemStats)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 10)
    .forEach(([name, stats]) => {
      itemData.push([name, stats.qty, stats.revenue.toFixed(2)]);
    });
  
  analyticsSheet.getRange(startRow + 1, 1, itemData.length, 3).setValues(itemData);
  analyticsSheet.getRange(startRow + 1, 1, 1, 3).setBackground('#fed7aa').setFontWeight('bold');
  
  // Items Bar Chart
  if (itemData.length > 1) {
    const itemChartRange = analyticsSheet.getRange(startRow + 1, 1, Math.min(itemData.length, 11), 2);
    const itemChart = analyticsSheet.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(itemChartRange)
      .setPosition(startRow, 5, 0, 0)
      .setOption('title', 'Top Selling Items')
      .setOption('colors', ['#f97316'])
      .setOption('width', 400)
      .setOption('height', 250)
      .setOption('legend', {position: 'none'})
      .build();
    analyticsSheet.insertChart(itemChart);
  }
  
  // ========== HOURLY DISTRIBUTION ==========
  const hourlyStats = {};
  for (let i = 0; i < 24; i++) {
    hourlyStats[i] = 0;
  }
  
  orders.forEach(order => {
    try {
      const orderTime = new Date(order[cols.orderTime]);
      const hour = orderTime.getHours();
      hourlyStats[hour]++;
    } catch (e) {}
  });
  
  const hourlyStartRow = startRow + itemData.length + 3;
  analyticsSheet.getRange(hourlyStartRow, 1).setValue('ORDERS BY HOUR');
  analyticsSheet.getRange(hourlyStartRow, 1).setFontSize(12).setFontWeight('bold');
  
  const hourlyData = [['Hour', 'Orders']];
  for (let i = 9; i <= 21; i++) { // 9 AM to 9 PM
    const label = i < 12 ? i + ' AM' : (i === 12 ? '12 PM' : (i - 12) + ' PM');
    hourlyData.push([label, hourlyStats[i]]);
  }
  
  analyticsSheet.getRange(hourlyStartRow + 1, 1, hourlyData.length, 2).setValues(hourlyData);
  analyticsSheet.getRange(hourlyStartRow + 1, 1, 1, 2).setBackground('#fed7aa').setFontWeight('bold');
  
  // Hourly Line Chart
  if (hourlyData.length > 1) {
    const hourlyChartRange = analyticsSheet.getRange(hourlyStartRow + 1, 1, hourlyData.length, 2);
    const hourlyChart = analyticsSheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(hourlyChartRange)
      .setPosition(hourlyStartRow, 5, 0, 0)
      .setOption('title', 'Peak Ordering Hours')
      .setOption('colors', ['#f97316'])
      .setOption('width', 400)
      .setOption('height', 250)
      .setOption('curveType', 'function')
      .setOption('legend', {position: 'none'})
      .build();
    analyticsSheet.insertChart(hourlyChart);
  }
  
  // ========== DAILY REVENUE TREND ==========
  const dailyStats = {};
  orders.forEach(order => {
    try {
      const orderTime = new Date(order[cols.orderTime]);
      const dateKey = Utilities.formatDate(orderTime, 'Asia/Kolkata', 'yyyy-MM-dd');
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { orders: 0, revenue: 0 };
      }
      dailyStats[dateKey].orders++;
      dailyStats[dateKey].revenue += parseFloat(order[cols.totalPrice]) || 0;
    } catch (e) {}
  });
  
  const dailyStartRow = hourlyStartRow + hourlyData.length + 3;
  analyticsSheet.getRange(dailyStartRow, 1).setValue('DAILY REVENUE TREND (Last 30 Days)');
  analyticsSheet.getRange(dailyStartRow, 1).setFontSize(12).setFontWeight('bold');
  
  const dailyData = [['Date', 'Orders', 'Revenue']];
  Object.entries(dailyStats)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .forEach(([date, stats]) => {
      dailyData.push([date, stats.orders, stats.revenue.toFixed(2)]);
    });
  
  analyticsSheet.getRange(dailyStartRow + 1, 1, dailyData.length, 3).setValues(dailyData);
  analyticsSheet.getRange(dailyStartRow + 1, 1, 1, 3).setBackground('#fed7aa').setFontWeight('bold');
  
  // Daily Revenue Chart
  if (dailyData.length > 1) {
    const dailyChartRange = analyticsSheet.getRange(dailyStartRow + 1, 1, dailyData.length, 3);
    const dailyChart = analyticsSheet.newChart()
      .setChartType(Charts.ChartType.COMBO)
      .addRange(dailyChartRange)
      .setPosition(dailyStartRow, 5, 0, 0)
      .setOption('title', 'Daily Orders & Revenue')
      .setOption('colors', ['#f97316', '#22c55e'])
      .setOption('width', 500)
      .setOption('height', 250)
      .setOption('seriesType', 'bars')
      .setOption('series', {1: {type: 'line', targetAxisIndex: 1}})
      .build();
    analyticsSheet.insertChart(dailyChart);
  }
  
  // ========== VEG VS NON-VEG ==========
  let vegCount = 0;
  let nonVegCount = 0;
  
  orders.forEach(order => {
    try {
      const items = JSON.parse(order[cols.itemsJson] || '[]');
      items.forEach(item => {
        const type = item.vegNonVeg || '';
        if (type === 'Veg') vegCount += item.qty || 1;
        else if (type === 'Non-Veg') nonVegCount += item.qty || 1;
      });
    } catch (e) {}
  });
  
  const vegStartRow = dailyStartRow + dailyData.length + 3;
  analyticsSheet.getRange(vegStartRow, 1).setValue('VEG VS NON-VEG');
  analyticsSheet.getRange(vegStartRow, 1).setFontSize(12).setFontWeight('bold');
  
  const vegData = [['Type', 'Items Sold'], ['Veg', vegCount], ['Non-Veg', nonVegCount]];
  analyticsSheet.getRange(vegStartRow + 1, 1, vegData.length, 2).setValues(vegData);
  analyticsSheet.getRange(vegStartRow + 1, 1, 1, 2).setBackground('#fed7aa').setFontWeight('bold');
  
  // Veg Pie Chart
  if (vegCount > 0 || nonVegCount > 0) {
    const vegChartRange = analyticsSheet.getRange(vegStartRow + 1, 1, 3, 2);
    const vegChart = analyticsSheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(vegChartRange)
      .setPosition(vegStartRow, 5, 0, 0)
      .setOption('title', 'Veg vs Non-Veg')
      .setOption('colors', ['#22c55e', '#ef4444'])
      .setOption('width', 300)
      .setOption('height', 200)
      .build();
    analyticsSheet.insertChart(vegChart);
  }
  
  // ========== FORMAT SHEET ==========
  analyticsSheet.setColumnWidth(1, 180);
  analyticsSheet.setColumnWidth(2, 100);
  analyticsSheet.setColumnWidth(3, 100);
  analyticsSheet.setColumnWidth(4, 150);
  
  // Freeze header
  analyticsSheet.setFrozenRows(3);
  
  Logger.log('Analytics dashboard generated successfully!');
}

/**
 * Set up daily analytics refresh
 * Run this once to create a daily trigger
 */
function setupAnalyticsTrigger() {
  // Remove existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'generateAnalyticsDashboard') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new daily trigger at 6 AM
  ScriptApp.newTrigger('generateAnalyticsDashboard')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();
  
  Logger.log('Analytics trigger set up - will refresh daily at 6 AM');
}

// ============================================
// SETUP ALL TRIGGERS - RUN THIS ONCE
// ============================================
/**
 * Sets up all required triggers for the application.
 * Run this function once after deploying the script.
 */
function setupAllTriggers() {
  // First, remove all existing triggers to avoid duplicates
  const existingTriggers = ScriptApp.getProjectTriggers();
  existingTriggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  Logger.log('Cleared ' + existingTriggers.length + ' existing triggers');
  
  // 1. Daily Backup - runs at midnight
  ScriptApp.newTrigger('dailyBackup')
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();
  Logger.log('✓ Daily Backup trigger created (midnight)');
  
  // 2. Weekly Sales Summary - runs every Sunday at 11 PM
  ScriptApp.newTrigger('weeklySalesSummary')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(23)
    .create();
  Logger.log('✓ Weekly Sales Summary trigger created (Sunday 11 PM)');
  
  // 3. Analytics Dashboard Refresh - runs daily at 6 AM
  ScriptApp.newTrigger('generateAnalyticsDashboard')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();
  Logger.log('✓ Analytics Dashboard trigger created (daily 6 AM)');
  
  // 4. onEdit trigger for Invoice generation
  ScriptApp.newTrigger('onEdit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();
  Logger.log('✓ onEdit trigger created (for Invoice_Trigger)');
  
  Logger.log('');
  Logger.log('========================================');
  Logger.log('ALL TRIGGERS SET UP SUCCESSFULLY!');
  Logger.log('========================================');
  Logger.log('');
  Logger.log('Triggers active:');
  Logger.log('1. Daily Backup - midnight');
  Logger.log('2. Weekly Sales - Sunday 11 PM');
  Logger.log('3. Analytics Refresh - daily 6 AM');
  Logger.log('4. Invoice Generation - on edit (Invoice_Trigger = Yes)');
  
  return { success: true, message: 'All triggers created' };
}
