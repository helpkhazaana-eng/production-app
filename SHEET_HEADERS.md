# Khazaana Google Sheets - CSV Headers Reference

Copy-paste ready headers for each sheet.

---

## 📦 Orders Sheet

```
Order_ID,User_ID,Restaurant_Name,Items_JSON,Total_Items,Subtotal,Tax_Amount,Delivery_Fee,Total_Price,Customer_Name,Customer_Phone,Customer_Email,Customer_Address,Latitude,Longitude,Order_Time,Order_Status,Terms_Accepted,Terms_Accepted_At,Admin_Notes,Invoice_Trigger,Invoice_URL,Created_At,Updated_At
```

| Column | Description |
|--------|-------------|
| Order_ID | Unique order identifier (e.g., ORD-XXXXXX) |
| User_ID | Customer user ID |
| Restaurant_Name | Name of restaurant |
| Items_JSON | JSON array of ordered items |
| Total_Items | Count of items |
| Subtotal | Price before tax/delivery |
| Tax_Amount | GST amount |
| Delivery_Fee | Delivery charge |
| Total_Price | Final total |
| Customer_Name | Customer's name |
| Customer_Phone | Phone number |
| Customer_Email | Email address |
| Customer_Address | Delivery address |
| Latitude | GPS latitude |
| Longitude | GPS longitude |
| Order_Time | When order was placed |
| Order_Status | Pending/Confirmed/Delivered/Rejected |
| Terms_Accepted | Yes/No |
| Terms_Accepted_At | Timestamp |
| Admin_Notes | Internal notes |
| Invoice_Trigger | Set to "Yes" to generate invoice |
| Invoice_URL | Generated invoice link |
| Created_At | Record creation time |
| Updated_At | Last update time |

---

## 👤 Users Sheet

```
User_ID,Name,Phone,Email,Address,Lat,Long,Created_At,Total_Orders,Last_Order_At
```

| Column | Description |
|--------|-------------|
| User_ID | Unique user identifier (e.g., USR-XXXXXX) |
| Name | Customer name |
| Phone | Phone number |
| Email | Email address |
| Address | Saved address |
| Lat | Latitude |
| Long | Longitude |
| Created_At | Account creation date |
| Total_Orders | Number of orders placed |
| Last_Order_At | Most recent order timestamp |

---

## 🧾 Invoices Sheet

```
Invoice_ID,Order_ID,Invoice_URL,Generated_At,Sent_To_Email,Email_Status,PDF_Size
```

| Column | Description |
|--------|-------------|
| Invoice_ID | Unique invoice identifier |
| Order_ID | Related order ID |
| Invoice_URL | Google Drive link to PDF |
| Generated_At | Generation timestamp |
| Sent_To_Email | Customer email |
| Email_Status | Sent/Failed/Pending |
| PDF_Size | File size in bytes |

---

## 📊 Weekly_Sales Sheet

```
Week_Start,Week_End,Total_Orders,Total_Revenue,Total_Tax,Total_Delivery_Fees,Avg_Order_Value,Top_Restaurant,Top_Restaurant_Orders,Generated_At
```

| Column | Description |
|--------|-------------|
| Week_Start | Start date of week |
| Week_End | End date of week |
| Total_Orders | Orders in that week |
| Total_Revenue | Total revenue |
| Total_Tax | Total tax collected |
| Total_Delivery_Fees | Total delivery fees |
| Avg_Order_Value | Average order value |
| Top_Restaurant | Best performing restaurant |
| Top_Restaurant_Orders | Orders for top restaurant |
| Generated_At | Report generation time |

---

## 💰 Sales Sheet

```
Sales_ID,Date,Month,Year,Total_Orders,Confirmed_Orders,Rejected_Orders,Total_Revenue,Notes
```

| Column | Description |
|--------|-------------|
| Sales_ID | Unique sales record ID |
| Date | Date of record |
| Month | Month name/number |
| Year | Year |
| Total_Orders | Total orders |
| Confirmed_Orders | Confirmed order count |
| Rejected_Orders | Rejected order count |
| Total_Revenue | Revenue for period |
| Notes | Additional notes |

---

## 📈 Analytics Sheet

Auto-generated dashboard with charts. No manual headers needed.

---

## 💾 Backup Sheets

Format: `Backup_YYYY-MM-DD`

Contains snapshot of Orders sheet data.

---

*Last updated: November 30, 2025*
