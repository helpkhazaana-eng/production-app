// Restaurant Types
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  opensAt: string;
  closesAt: string;
  status: 'open' | 'closed';
  category: string;
  featured: boolean;
  rating: number;
  cuisine: string[];
  priceRange: '₹' | '₹₹' | '₹₹₹';
  costForTwo: number; // Cost for two people in rupees
  menuFile: string;
}

// Menu Item Types
export interface MenuItem {
  itemName: string;
  price: number;
  category: string;
  vegNonVeg: 'Veg' | 'Non-Veg';
  description?: string;
  inStock?: boolean;
}

// Cart Types
export interface CartItem extends MenuItem {
  restaurantId: string;
  restaurantName: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  subtotal: number;
  tax: number;
  total: number;
  deliveryFee: number;
}

// Order Types
export interface Customer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface Order {
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  customer: Customer;
  subtotal: number;
  tax: number;
  total: number;
  deliveryFee?: number;
  orderTime: string;
  status: 'pending' | 'confirmed' | 'delivered';
}

// Ad Types
export interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  aspectRatio: string;
  placement: 'hero' | 'banner' | 'carousel' | 'sidebar';
  priority: number;
}

// AppSheet API Types
export interface AppSheetOrder {
  Order_ID: string;
  Restaurant_ID: string;
  Restaurant_Name: string;
  Items_JSON: string;
  Total_Items: number;
  Subtotal: number;
  Tax_Amount: number;
  Total_Price: number;
  Customer_Name: string;
  Customer_Phone: string;
  Customer_Email?: string;
  Customer_Address: string;
  Latitude?: number;
  Longitude?: number;
  Order_Time: string;
  Order_Status: string;
  Invoice_Trigger: boolean;
}
