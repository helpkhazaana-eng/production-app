#!/usr/bin/env node
/**
 * Menu Price Validation Script
 * Runs before build to catch CSV parsing issues
 * 
 * Checks:
 * - Prices are valid numbers (not 0, not NaN)
 * - No commas in unquoted item names
 * - All required fields present
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MENUS_DIR = path.join(__dirname, '..', 'src', 'data', 'menus-csv');
const MIN_PRICE = 5;  // Minimum valid price in ₹
const MAX_PRICE = 5000; // Maximum valid price in ₹

let hasErrors = false;
let totalItems = 0;
let validItems = 0;

console.log('\n🔍 MENU PRICE VALIDATION\n');
console.log('='.repeat(50));

// Get all CSV files
const csvFiles = fs.readdirSync(MENUS_DIR).filter(f => f.endsWith('.csv'));

csvFiles.forEach(filename => {
  const filePath = path.join(MENUS_DIR, filename);
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      const headerMap = {
        'Item Name': 'itemName',
        'Price (₹)': 'price',
        'Category': 'category',
        'Veg/Non-Veg': 'vegNonVeg',
        'Description': 'description'
      };
      return headerMap[header] || header;
    }
  });
  
  const items = result.data;
  const errors = [];
  
  items.forEach((item, index) => {
    totalItems++;
    const lineNum = index + 2; // +2 for header and 0-index
    const price = parseFloat(item.price);
    
    // Check for missing item name
    if (!item.itemName || item.itemName.trim() === '') {
      errors.push(`  Line ${lineNum}: Missing item name`);
      return;
    }
    
    // Check for invalid price
    if (isNaN(price) || price === 0) {
      errors.push(`  Line ${lineNum}: Invalid price "${item.price}" for "${item.itemName}"`);
      return;
    }
    
    // Check for suspiciously low price (likely parsing error)
    if (price < MIN_PRICE) {
      errors.push(`  Line ${lineNum}: ⚠️  SUSPICIOUS LOW PRICE ₹${price} for "${item.itemName}" - possible CSV parsing error!`);
      return;
    }
    
    // Check for suspiciously high price
    if (price > MAX_PRICE) {
      errors.push(`  Line ${lineNum}: ⚠️  SUSPICIOUS HIGH PRICE ₹${price} for "${item.itemName}"`);
      return;
    }
    
    // Check for missing category
    if (!item.category || item.category.trim() === '') {
      errors.push(`  Line ${lineNum}: Missing category for "${item.itemName}"`);
      return;
    }
    
    // Check for missing veg/non-veg
    if (!item.vegNonVeg || item.vegNonVeg.trim() === '') {
      errors.push(`  Line ${lineNum}: Missing Veg/Non-Veg for "${item.itemName}"`);
      return;
    }
    
    validItems++;
  });
  
  // Print results for this file
  const status = errors.length === 0 ? '✅' : '❌';
  console.log(`\n${status} ${filename} (${items.length} items)`);
  
  if (errors.length > 0) {
    hasErrors = true;
    errors.forEach(err => console.log(err));
  }
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 SUMMARY: ${validItems}/${totalItems} items valid\n`);

if (hasErrors) {
  console.log('❌ VALIDATION FAILED - Fix errors before deploying!\n');
  process.exit(1);
} else {
  console.log('✅ ALL MENUS VALIDATED SUCCESSFULLY!\n');
  process.exit(0);
}
