import Papa from 'papaparse';
import type { MenuItem } from '../types';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger, perfMonitor } from './logger';

export async function loadMenuFromCSV(filename: string): Promise<MenuItem[]> {
  perfMonitor.start(`loadMenu:${filename}`);
  logger.debug(`Loading menu from ${filename}`, undefined, 'CSV_LOADER');
  
  try {
    // Read CSV file from src/data/menus-csv/
    const filePath = join(process.cwd(), 'src', 'data', 'menus-csv', filename);
    const csvContent = readFileSync(filePath, 'utf-8');
    
    logger.debug(`CSV file read successfully: ${filename}`, { size: csvContent.length }, 'CSV_LOADER');
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Normalize headers to match our interface
          const headerMap: Record<string, string> = {
            'Item Name': 'itemName',
            'Price (₹)': 'price',
            'Category': 'category',
            'Veg/Non-Veg': 'vegNonVeg',
            'Description': 'description'
          };
          return headerMap[header] || header;
        },
        transform: (value: string, field: string) => {
          // Transform price to number
          if (field === 'price') {
            return parseFloat(value) || 0;
          }
          // Ensure vegNonVeg is properly formatted
          if (field === 'vegNonVeg') {
            return value.trim() === 'Veg' ? 'Veg' : 'Non-Veg';
          }
          return value;
        },
        complete: (results) => {
          const items = results.data as MenuItem[];
          // Filter out invalid items
          const validItems = items.filter(item => 
            item.itemName && 
            item.price && 
            item.category &&
            item.vegNonVeg
          );
          
          const duration = perfMonitor.end(`loadMenu:${filename}`);
          logger.info(
            `Menu loaded successfully: ${filename}`,
            { itemCount: validItems.length, duration },
            'CSV_LOADER'
          );
          
          resolve(validItems);
        },
        error: (error: Error) => {
          logger.error(
            `CSV parsing error: ${filename}`,
            error,
            'CSV_LOADER',
            { filename }
          );
          reject(error);
        }
      });
    });
  } catch (error) {
    logger.error(
      `Failed to load menu: ${filename}`,
      error instanceof Error ? error : new Error(String(error)),
      'CSV_LOADER',
      { filename }
    );
    perfMonitor.end(`loadMenu:${filename}`);
    return [];
  }
}

// Group menu items by category
export function groupByCategory(items: MenuItem[]): Record<string, MenuItem[]> {
  return items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
}

// Filter menu items
export function filterMenuItems(
  items: MenuItem[], 
  filters: {
    search?: string;
    vegOnly?: boolean;
    nonVegOnly?: boolean;
    category?: string;
  }
): MenuItem[] {
  let filtered = [...items];
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(item => 
      item.itemName.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    );
  }
  
  if (filters.vegOnly) {
    filtered = filtered.filter(item => item.vegNonVeg === 'Veg');
  }
  
  if (filters.nonVegOnly) {
    filtered = filtered.filter(item => item.vegNonVeg === 'Non-Veg');
  }
  
  if (filters.category) {
    filtered = filtered.filter(item => item.category === filters.category);
  }
  
  return filtered;
}
