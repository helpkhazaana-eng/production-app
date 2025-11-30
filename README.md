# 🍽️ Khazaana - Food Ordering Platform

A modern, SEO-optimized food ordering platform built with Astro.js, featuring a Zomato-style UI, WhatsApp integration, and comprehensive error management.

**Founded by Md. Askin Ali**

## 📞 Contact

- **Phone/WhatsApp**: +91 86959 02696
- **Email**: info@khazaana.com
- **Instagram**: [@_khazaana](https://www.instagram.com/_khazaana/)
- **Services**: Delivery & New Restaurant Registration

## ✨ Features

### Core Functionality
- 🍔 **6 Partner Restaurants** with CSV-based menus
- 🛒 **Smart Cart System** - One restaurant per order enforcement
- 📱 **WhatsApp Checkout** - Direct order placement via WhatsApp
- 📍 **Geolocation Support** - "Get My Location" feature
- 📦 **Order History** - localStorage-based order tracking
- 🌐 **Bengali Translation** - Google Translate integration
- 📢 **Smart Announcements** - Admin-configurable announcement system

### Technical Features
- ⚡ **Astro.js** - Lightning-fast static site generation
- 🎨 **Sushi Design System** - Zomato-style UI components
- 📊 **Error Management** - Comprehensive logging and monitoring
- 🛠️ **DevTools** - Real-time debugging panel (development only)
- 📈 **Performance Monitoring** - Built-in performance tracking
- 🔒 **AppSheet Integration** - Mock API ready for production
- 📱 **PWA Support** - Add to Home Screen functionality
- 🎯 **SEO Optimized** - Meta tags, schemas, sitemap

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd khazaana-app
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:4321` to see the app.

### Build for Production

```bash
npm run build
npm run preview
```

## 📂 Project Structure

```
khazaana-app/
├── src/
│   ├── components/
│   │   ├── common/          # Header, Footer, AnnouncementBar, DevTools
│   │   ├── restaurant/      # Restaurant-specific components
│   │   └── ui/              # Reusable UI components
│   ├── layouts/
│   │   └── BaseLayout.astro # Main layout with SEO
│   ├── pages/
│   │   ├── index.astro      # Landing page
│   │   ├── about.astro      # About page
│   │   ├── cart.astro       # Shopping cart
│   │   ├── checkout.astro   # Checkout with WhatsApp
│   │   ├── history.astro    # Order history
│   │   └── restaurants/
│   │       ├── index.astro  # Restaurant listing
│   │       └── [id].astro   # Restaurant menu (dynamic)
│   ├── lib/
│   │   ├── logger.ts        # Error management & logging
│   │   ├── cart.ts          # Cart management
│   │   ├── csv-loader.ts    # CSV menu parser
│   │   ├── whatsapp.ts      # WhatsApp integration
│   │   └── appsheet.ts      # AppSheet API (mock)
│   ├── data/
│   │   ├── restaurants.ts   # Restaurant configuration
│   │   ├── ads.ts           # Advertisement management
│   │   ├── announcements.ts # Announcement system
│   │   └── menus-csv/       # CSV menu files
│   ├── types/
│   │   └── index.ts         # TypeScript definitions
│   └── styles/
│       └── global.css       # Sushi Design System
├── public/
│   ├── images/              # Logo, founder, partners, ads
│   ├── manifest.json        # PWA manifest
│   └── service-worker.js    # Service worker
└── package.json
```

## 🎯 Key Pages

1. **Landing Page** (`/`) - Hero, founder story, featured restaurants, announcements
2. **About** (`/about`) - Founder story, values, partner restaurants
3. **Restaurants** (`/restaurants`) - Listing with search, filters, tabs
4. **Menu** (`/restaurants/[id]`) - Dynamic menu with cart integration
5. **Cart** (`/cart`) - Review items, update quantities
6. **Checkout** (`/checkout`) - Customer form, WhatsApp integration
7. **History** (`/history`) - Past orders from localStorage

## 🛠️ Developer Tools

### DevTools Panel (Development Only)
Access the floating purple bug icon (🐛) in the bottom-right corner to:
- View real-time errors
- Monitor system logs
- Check performance metrics
- Export logs as JSON
- Track cart and storage stats

### Logging System

```typescript
import { logger } from './lib/logger';

logger.debug('Debug message', data, 'CONTEXT');
logger.info('Info message', data, 'CONTEXT');
logger.warn('Warning message', data, 'CONTEXT');
logger.error('Error message', error, 'CONTEXT', data);
logger.critical('Critical error', error, 'CONTEXT', data);
```

### Performance Monitoring

```typescript
import { perfMonitor } from './lib/logger';

perfMonitor.start('operation-name');
// ... do work
perfMonitor.end('operation-name'); // Logs duration
```

## 📢 Managing Announcements

Edit `/src/data/announcements.ts`:

```typescript
{
  id: 'unique-id',
  message: '🎉 Your announcement here',
  type: 'info', // 'info' | 'success' | 'warning' | 'promo'
  active: true,
  startDate: '2024-01-01', // Optional
  endDate: '2024-12-31',   // Optional
  link: '/restaurants',     // Optional
  linkText: 'Order Now'     // Optional
}
```

## 🍽️ Adding New Restaurants

1. Add CSV menu file to `/src/data/menus-csv/`
2. Update `/src/data/restaurants.ts`:

```typescript
{
  id: 'restaurant-id',
  name: 'Restaurant Name',
  address: 'Full Address',
  phone: '1234567890',
  whatsapp: '1234567890',
  opensAt: '09:00',
  closesAt: '21:00',
  status: 'open',
  category: 'Cuisine Type',
  featured: true,
  rating: 4.5,
  cuisine: ['Indian', 'Chinese'],
  priceRange: '₹₹',
  menuFile: 'restaurant-menu.csv'
}
```

## 📱 WhatsApp Integration

Orders are sent via WhatsApp with:
- Order ID
- Restaurant name
- Item list with quantities
- Customer details
- Delivery address
- Google Maps location link
- Total amount

## 🔒 AppSheet Backend (Optional)

The app includes mock AppSheet integration. To enable real backend:

1. Set up Google Sheets with provided templates
2. Create AppSheet app
3. Update `/src/lib/appsheet.ts` with real credentials
4. Set `mockMode: false` in AppSheet config

## 🎨 Customization

### Colors
Edit CSS variables in `/src/styles/global.css`:

```css
:root {
  --color-primary: #FF6B35;
  --color-primary-dark: #E85A2A;
  --color-veg: #0F8A5F;
  --color-non-veg: #E43B4F;
}
```

### Sushi Design System
Pre-built classes available:
- `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.restaurant-card`, `.menu-item-card`
- `.veg-indicator`, `.non-veg-indicator`
- `.badge`, `.badge-success`, `.badge-danger`

## 📊 SEO Features

- ✅ Meta tags (title, description, OG, Twitter)
- ✅ JSON-LD schemas (Website, LocalBusiness, Restaurant)
- ✅ Canonical URLs
- ✅ Sitemap generation
- ✅ robots.txt
- ✅ PWA manifest

## 🧞 Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build for production to `./dist/` |
| `npm run preview` | Preview production build |
| `npm run astro check` | Type check |

## 📝 License

All rights reserved © 2024 Khazaana - Founded by Md. Askin Ali

## 🤝 Support

For delivery services or new restaurant registration:
- Call/WhatsApp: **+91 86959 02696**
- Follow us: [@_khazaana](https://www.instagram.com/_khazaana/)
