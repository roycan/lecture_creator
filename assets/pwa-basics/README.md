# PWA Practice Files - README

This folder contains templates and examples for Progressive Web Apps (PWAs) optimized for the Philippine context.

## 📁 Contents

### manifest.json Templates
Ready-to-use PWA manifest files for different use cases:

1. **manifest-store.json** - Sari-Sari Store Inventory
   - Business/productivity app
   - Shortcuts for quick actions (Add Sale, Check Inventory)
   - Share target for sharing products
   - Tagalog language (tl-PH)
   
2. **manifest-barangay.json** - Barangay Services Directory
   - Government/community app
   - Shortcuts for Emergency, Clearance, Announcements
   - Blue theme (official government color)
   - Filipino/English bilingual
   
3. **manifest-school.json** - Student Portal
   - Education app
   - Shortcuts for Grades, Schedule, Assignments
   - Green theme (academic, growth)
   - IARC rating included

**How to use:**
1. Copy the appropriate template
2. Rename to `manifest.json`
3. Update app name, icons, colors
4. Link in HTML: `<link rel="manifest" href="manifest.json">`

### Service Worker Templates
Pre-built service workers with different caching strategies:

1. **sw-cache-first.js** - Cache First (Offline First)
   - Serves from cache, network as fallback
   - Best for: Static assets, rarely changing content
   - Philippine benefits: Works during brownouts, saves ₱50-200/month
   - Use cases: Store inventory UI, barangay forms, student materials
   
2. **sw-network-first.js** - Network First (Fresh First)
   - Tries network, cache as fallback
   - Best for: Dynamic content (news, prices, user data)
   - Timeout: 3 seconds (adjustable for 2G/3G/4G)
   - Use cases: Price checkers, news feeds, grade portals

**How to use:**
1. Copy the appropriate template
2. Customize `CACHE_NAME` and `ASSETS_TO_CACHE`
3. Register in HTML (instructions included in files)
4. Adjust TIMEOUT for Philippine internet speeds

### Complete Example Apps
Full working PWA examples:

1. **offline-grocery-list.html** - Complete Offline-First PWA
   - Grocery list with localStorage
   - Works 100% offline
   - Install prompt
   - Online/offline status indicator
   - Filipino UI labels
   - No backend needed

## 🎓 Learning Path

### Week 1: Understanding PWAs
1. Read the PWA lecture Section 1-3
2. Study `manifest-store.json` structure
3. Modify colors, name, icons
4. Test manifest with Lighthouse

### Week 2: Service Workers
1. Read PWA lecture Section 4-5
2. Study `sw-cache-first.js` line by line
3. Register SW in a simple HTML page
4. Test offline functionality

### Week 3: Building Your PWA
1. Choose a use case (store, barangay, school)
2. Copy appropriate manifest template
3. Copy appropriate SW template
4. Build your app UI
5. Test install and offline features

### Week 4: Advanced Features
1. Study `offline-grocery-list.html`
2. Add localStorage for data persistence
3. Implement Background Sync
4. Add Push Notifications
5. Deploy and test on real devices

## 🇵🇭 Philippine Context

### Data Cost Savings

**Without PWA (Regular Website):**
```
Grocery List App - Regular Website
- Every page load: 500 KB = ₱50
- 10 visits/day × 30 days = 300 visits
- Total: 150 MB = ₱1,500/month
```

**With PWA (Offline-First):**
```
Grocery List App - PWA
- Initial install: 500 KB = ₱50 (one time)
- Subsequent visits: 0 KB = ₱0 (from cache)
- 10 visits/day × 30 days = 300 visits
- Total: 500 KB = ₱50/month
- SAVINGS: ₱1,450/month (96% reduction!)
```

### Brownout Resilience

**Philippine Reality:**
- Brownouts: 2-6 hours daily in many areas
- Spotty mobile data during storms
- Rural areas: unreliable connections

**PWA Solution:**
- Cache entire app during first load
- Works 100% during brownouts
- Save data locally (localStorage/IndexedDB)
- Sync when connection returns
- Zero frustration for users

### Device Compatibility

**Common Budget Phones:**
- Samsung Galaxy A series
- OPPO A series
- Realme series
- Xiaomi Redmi series

**PWA Benefits:**
- Works on Android 5.0+ (Lollipop)
- No app store needed (direct install)
- Smaller than native apps (50-100 KB vs 50-100 MB)
- More space for photos/apps
- Faster updates (no store approval)

## 📱 Testing Your PWA

### Desktop Testing (Chrome DevTools):

1. **Open DevTools** (F12)
2. **Application Tab:**
   - Manifest: Check all fields loaded correctly
   - Service Workers: Verify registration
   - Cache Storage: See cached files
   - IndexedDB: View stored data
3. **Lighthouse Tab:**
   - Run PWA audit
   - Fix any issues
   - Aim for 100% PWA score

### Mobile Testing (Real Device):

1. **Deploy to hosting** (Netlify, Vercel, GitHub Pages)
2. **Must use HTTPS** (PWAs require secure connection)
3. **Open in Chrome Android**
4. **Test install prompt:**
   - Should see "Add to Home Screen" or install banner
   - Install the app
   - Check icon on home screen
5. **Test offline:**
   - Turn on airplane mode
   - Open app
   - Should work fully offline

### Checklist:
- [ ] Manifest loads correctly
- [ ] Icons display properly (192x192, 512x512)
- [ ] Theme color appears in toolbar
- [ ] Install prompt shows
- [ ] App installs to home screen
- [ ] Opens in standalone mode (no browser UI)
- [ ] Service worker registers successfully
- [ ] Files cache correctly
- [ ] Works offline (airplane mode test)
- [ ] Online/offline status updates

## 🛠️ Customization Guide

### Customizing manifest.json:

```json
{
  "name": "Your App Full Name Here",
  "short_name": "Short",  // 12 characters max
  "theme_color": "#4CAF50",  // Your brand color
  "background_color": "#ffffff",  // Splash screen background
  "start_url": "/",  // Where app opens
  "display": "standalone",  // No browser UI
  "orientation": "portrait",  // or "any", "landscape"
  "icons": [
    {
      "src": "icon-192.png",  // Create these with: https://realfavicongenerator.net/
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Customizing Service Worker:

```javascript
// Update these for your app:
const CACHE_NAME = 'my-app-v1';  // Increment when you update

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  // Add all your files here
];

// For Network-First, adjust timeout:
const TIMEOUT = 3000;  // 3 seconds for 3G
// 5000 for 2G users
// 1000 for 4G users
```

## 💡 Common Use Cases

### 1. Sari-Sari Store Inventory
**Features:**
- Product list with prices
- Stock tracking
- Sales recording
- Works offline during brownouts

**Files needed:**
- `manifest-store.json`
- `sw-cache-first.js` (products rarely change)
- localStorage for inventory data

### 2. Barangay Clearance System
**Features:**
- Request clearance form
- Track application status
- View barangay announcements
- Officials directory

**Files needed:**
- `manifest-barangay.json`
- `sw-cache-first.js` (forms don't change)
- IndexedDB for applications

### 3. Student Grade Portal
**Features:**
- View grades
- Class schedule
- Assignments list
- Download materials

**Files needed:**
- `manifest-school.json`
- `sw-network-first.js` (grades might update)
- Cache for downloaded PDFs

## 🚀 Deployment

### Free Hosting Options:

1. **Netlify** (Recommended)
   - Drag and drop deployment
   - Automatic HTTPS
   - Free plan sufficient
   - Deploy: https://app.netlify.com/drop

2. **Vercel**
   - Git integration
   - Automatic HTTPS
   - Fast global CDN
   - Deploy: https://vercel.com/

3. **GitHub Pages**
   - Free for public repos
   - Automatic HTTPS
   - Custom domain support
   - Deploy: Settings → Pages

### Requirements:
- ✅ Must use HTTPS (PWAs require secure connection)
- ✅ manifest.json in root directory
- ✅ Service worker in root directory
- ✅ Icons in correct sizes

## 🐛 Troubleshooting

### Install Prompt Doesn't Show:
**Check:**
- [ ] Using HTTPS (not http)
- [ ] manifest.json valid and linked
- [ ] Service worker registered successfully
- [ ] Icons correct sizes (192x192, 512x512)
- [ ] Visited site 2+ times
- [ ] User engaged with site (clicks, scrolls)

### Service Worker Not Caching:
**Check:**
- [ ] Paths in ASSETS_TO_CACHE are correct
- [ ] Service worker registered successfully
- [ ] No console errors
- [ ] Clear cache and try again

### Offline Mode Not Working:
**Check:**
- [ ] Service worker activated
- [ ] Files actually cached (check DevTools)
- [ ] Fetch event handling requests
- [ ] Try hard refresh (Ctrl+Shift+R)

### Changes Not Showing:
**Solution:**
1. Update CACHE_NAME version (`v1` → `v2`)
2. Unregister old service worker in DevTools
3. Clear cache
4. Hard refresh

## 📚 Additional Resources

**In PWA Lecture:**
- Section 1-3: PWA basics and manifest.json
- Section 4-5: Service workers and caching
- Section 6: Offline detection
- Section 7: Installability
- Section 8: Testing

**External:**
- [PWA Builder](https://www.pwabuilder.com/) - Generate manifest and SW
- [Workbox](https://developers.google.com/web/tools/workbox) - Advanced SW library
- [Can I Use](https://caniuse.com/serviceworkers) - Check browser support

## ✅ Pre-Deployment Checklist

Before sharing your PWA:
- [ ] manifest.json complete and valid
- [ ] Icons created (192x192 and 512x512 minimum)
- [ ] Service worker registered
- [ ] Tested offline functionality
- [ ] Lighthouse PWA score 100%
- [ ] Tested on real mobile device
- [ ] Works on slow 3G connection
- [ ] Install prompt shows correctly
- [ ] Deployed to HTTPS hosting
- [ ] Meta tags for theme color

## 🤝 Contributing

Found a better template or example? Improvements welcome!
1. Fork this repo
2. Add your template/example
3. Document Philippine context benefits
4. Submit a pull request

---

**For Grade 9 Filipino Students**  
**Part of Progressive Web Apps Lecture**  
**Last Updated:** November 13, 2025  

**Made with ❤️ for Filipino developers**  
**Optimized for Philippine internet conditions**
