# Khazaana Admin Prompts for AI Code Editors

> **Purpose:** This document contains ready-to-use prompts for AI code editors (Windsurf, Cursor, GitHub Copilot, etc.) to manage the Khazaana food ordering platform.
> 
> **How to Use:** Copy the relevant prompt, paste it into your AI editor, and answer the questions it asks.

---

## Table of Contents

1. [Featured Restaurant Management](#1-featured-restaurant-management)
2. [Exclusive Offer Management](#2-exclusive-offer-management)
3. [Quick Reference](#quick-reference)

---

# 1. Featured Restaurant Management

## 1.1 Set a Restaurant as Featured

**Copy and paste this prompt:**

```
I need to update the featured restaurant on Khazaana. Before making changes, please ask me:

1. Which restaurant should be featured? (Show me the list of available restaurants)
2. Should I remove the "featured" status from the currently featured restaurant(s)?

CONTEXT FOR AI:
- File to edit: src/data/restaurants.ts
- The `featured` property is a boolean (true/false) in each restaurant object
- Currently available restaurants and their IDs:
  * Cups N Crumbs (id: 'cupsncrumbs') - Currently featured: true
  * Aaviora (id: 'aaviora')
  * Arsalan (id: 'arsalan')
  * Bandhu Hotel (id: 'bandhu-hotel')
  * Bhole Baba (id: 'bholebaba')
  * White Chocolate (id: 'whitechocolate')

After I answer, update the `featured: true/false` property for the relevant restaurants in src/data/restaurants.ts
```

---

## 1.2 Remove Featured Status from All Restaurants

**Copy and paste this prompt:**

```
Remove the "featured" status from all restaurants on Khazaana.

CONTEXT FOR AI:
- File to edit: src/data/restaurants.ts
- Set `featured: false` for ALL restaurants in the restaurants array
- There are 6 restaurants total

Please confirm before making changes.
```

---

## 1.3 Feature Multiple Restaurants

**Copy and paste this prompt:**

```
I want to feature multiple restaurants on Khazaana. Please ask me:

1. Which restaurants should be featured? (I can select multiple)
2. Should all other restaurants be unfeatured?

CONTEXT FOR AI:
- File to edit: src/data/restaurants.ts
- Available restaurants:
  * cupsncrumbs - Cups N Crumbs
  * aaviora - Aaviora
  * arsalan - Arsalan
  * bandhu-hotel - Bandhu Hotel
  * bholebaba - Bhole Baba
  * whitechocolate - White Chocolate

Update the `featured` property accordingly after I respond.
```

---

# 2. Exclusive Offer Management

## 2.1 Add a New Exclusive Offer

**Copy and paste this prompt:**

```
I want to add a new exclusive offer to Khazaana. Please ask me these questions one by one:

1. Which restaurant is this offer from?
   Available restaurants:
   - cupsncrumbs (Cups N Crumbs)
   - aaviora (Aaviora)
   - arsalan (Arsalan)
   - bandhu-hotel (Bandhu Hotel)
   - bholebaba (Bhole Baba)
   - whitechocolate (White Chocolate)

2. What is the name of the dish/combo? (e.g., "Chicken Biryani Special", "Waffle Combo Deal")

3. What is included in this offer? (Short description, e.g., "2 Waffles + 1 Cold Coffee")

4. What is the ORIGINAL price (before discount) in rupees? (Just the number)

5. What is the OFFER price (after discount) in rupees? (Just the number)

6. Is this offer Veg or Non-Veg?

7. What is the delivery charge? (Enter 0 for FREE delivery)

8. When does this offer START? (Format: YYYY-MM-DD, e.g., 2025-01-01)

9. When does this offer END? (Format: YYYY-MM-DD, e.g., 2025-01-31)

10. Any terms and conditions? (Optional, e.g., "Cannot combine with other offers")

CONTEXT FOR AI:
- File to edit: src/data/offers.ts
- Add new offer to the `exclusiveOffers` array
- Calculate discountPercent automatically: Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
- Generate a unique ID from dish name (lowercase, hyphens, e.g., "chicken-biryani-special")
- Set isActive: true

After collecting all answers, add the offer object to src/data/offers.ts in the exclusiveOffers array.
```

---

## 2.2 Remove/Deactivate an Offer

**Copy and paste this prompt:**

```
I want to remove or deactivate an offer on Khazaana. Please:

1. First, show me all current offers in src/data/offers.ts with their:
   - Offer ID
   - Dish name
   - Restaurant
   - Current status (isActive)

2. Then ask me:
   - Which offer should I deactivate? (by ID or dish name)
   - Should I DELETE it permanently or just set isActive to false?

CONTEXT FOR AI:
- File to edit: src/data/offers.ts
- To deactivate: Set `isActive: false`
- To delete: Remove the entire offer object from the array
- Deactivating is safer as it can be reactivated later
```

---

## 2.3 Edit an Existing Offer

**Copy and paste this prompt:**

```
I want to edit an existing offer on Khazaana. Please:

1. First, list all offers in src/data/offers.ts showing:
   - Dish name
   - Restaurant
   - Current price (original → offer)
   - End date
   - Status

2. Ask me which offer to edit (by dish name)

3. Then ask what I want to change:
   - [ ] Dish name
   - [ ] Description
   - [ ] Original price
   - [ ] Offer price
   - [ ] Delivery charge
   - [ ] Start date
   - [ ] End date
   - [ ] Veg/Non-Veg
   - [ ] Terms
   - [ ] Active status

CONTEXT FOR AI:
- File to edit: src/data/offers.ts
- If price changes, recalculate discountPercent
- Dates must be in YYYY-MM-DD format
```

---

## 2.4 Extend an Offer's End Date

**Copy and paste this prompt:**

```
I want to extend the end date of an offer. Please:

1. Show me all active offers with their current end dates
2. Ask which offer to extend
3. Ask for the new end date (YYYY-MM-DD format)

CONTEXT FOR AI:
- File to edit: src/data/offers.ts
- Only update the `endDate` field
- Validate date format is YYYY-MM-DD
```

---

## 2.5 Create a Flash Sale (Short Duration Offer)

**Copy and paste this prompt:**

```
I want to create a flash sale offer. Please ask me:

1. Which restaurant?
2. What dish/combo?
3. What's included?
4. Original price?
5. Flash sale price?
6. Veg or Non-Veg?
7. How many days should this flash sale run? (1-7 days)

CONTEXT FOR AI:
- File to edit: src/data/offers.ts
- Set startDate to today's date
- Set endDate to startDate + number of days specified
- Set deliveryCharge to 0 (flash sales get free delivery)
- Add "FLASH SALE" prefix to terms
- Set isActive: true
```

---

## 2.6 Bulk Deactivate All Offers

**Copy and paste this prompt:**

```
Deactivate ALL offers on Khazaana temporarily.

CONTEXT FOR AI:
- File to edit: src/data/offers.ts
- Set `isActive: false` for ALL offers in the exclusiveOffers array
- Do NOT delete any offers
- Confirm the number of offers deactivated

This is useful for maintenance or when we want to pause all promotions.
```

---

## 2.7 Reactivate an Offer

**Copy and paste this prompt:**

```
I want to reactivate a previously deactivated offer. Please:

1. Show me all INACTIVE offers (isActive: false)
2. Ask which one to reactivate
3. Ask if I want to update the end date (since it may have passed)

CONTEXT FOR AI:
- File to edit: src/data/offers.ts
- Set `isActive: true` for the selected offer
- If end date has passed, ask for new end date
```

---

# Quick Reference

## File Locations

| What | File Path |
|------|-----------|
| Restaurant Data | `src/data/restaurants.ts` |
| Offers Data | `src/data/offers.ts` |
| Cart Logic | `src/lib/cart.ts` |
| Type Definitions | `src/types/index.ts` |

## Restaurant IDs

| Restaurant Name | ID to Use |
|-----------------|-----------|
| Cups N Crumbs | `cupsncrumbs` |
| Aaviora | `aaviora` |
| Arsalan | `arsalan` |
| Bandhu Hotel | `bandhu-hotel` |
| Bhole Baba | `bholebaba` |
| White Chocolate | `whitechocolate` |

## Offer Object Structure

```typescript
{
  id: string,              // Unique ID (lowercase, hyphens)
  dishName: string,        // Display name
  description: string,     // What's included
  restaurantId: string,    // Must match restaurant ID
  restaurantName: string,  // Display name of restaurant
  originalPrice: number,   // Price before discount (no ₹ symbol)
  offerPrice: number,      // Price after discount (no ₹ symbol)
  discountPercent: number, // Calculated: ((original-offer)/original)*100
  deliveryCharge: number,  // 0 for free delivery
  startDate: string,       // 'YYYY-MM-DD' format
  endDate: string,         // 'YYYY-MM-DD' format
  isActive: boolean,       // true to show, false to hide
  vegNonVeg: 'Veg' | 'Non-Veg',
  terms: string            // Optional terms & conditions
}
```

## Restaurant Object Structure

```typescript
{
  id: string,
  name: string,
  featured: boolean,       // true = shows in Featured tab
  rating: number,
  cuisine: string[],
  // ... other fields
}
```

---

## Tips for AI Editors

1. **Always ask questions first** before making changes
2. **Show current state** before modifications
3. **Confirm changes** before saving
4. **Validate data** (dates, IDs, prices)
5. **Calculate automatically** (discount percentage)

---

## Example Conversation Flow

**User:** I want to add a new offer

**AI:** Sure! Let me ask you a few questions:

1. Which restaurant is this offer from?
   - cupsncrumbs (Cups N Crumbs)
   - aaviora (Aaviora)
   - arsalan (Arsalan)
   - bandhu-hotel (Bandhu Hotel)
   - bholebaba (Bhole Baba)
   - whitechocolate (White Chocolate)

**User:** arsalan

**AI:** Great! What is the name of the dish or combo?

**User:** Mutton Biryani Feast

**AI:** What is included in this offer?

**User:** Full Mutton Biryani + 2 Kebabs + Raita

**AI:** What is the original price (before discount)?

**User:** 450

**AI:** What is the offer price (after discount)?

**User:** 349

**AI:** Is this Veg or Non-Veg?

**User:** Non-Veg

**AI:** What is the delivery charge? (Enter 0 for free delivery)

**User:** 30

**AI:** When does this offer start? (YYYY-MM-DD)

**User:** 2025-01-01

**AI:** When does this offer end? (YYYY-MM-DD)

**User:** 2025-01-31

**AI:** Any terms and conditions? (Press enter to skip)

**User:** Weekend special only

**AI:** 
I'll add this offer to `src/data/offers.ts`:

```javascript
{
  id: 'mutton-biryani-feast',
  dishName: 'Mutton Biryani Feast',
  description: 'Full Mutton Biryani + 2 Kebabs + Raita',
  restaurantId: 'arsalan',
  restaurantName: 'Arsalan',
  originalPrice: 450,
  offerPrice: 349,
  discountPercent: 22,  // Calculated: ((450-349)/450)*100
  deliveryCharge: 30,
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  isActive: true,
  vegNonVeg: 'Non-Veg',
  terms: 'Weekend special only'
}
```

Should I proceed with adding this offer?

---

*Document Version: 1.0*
*Last Updated: November 2025*
*For: Khazaana Food Ordering Platform*
