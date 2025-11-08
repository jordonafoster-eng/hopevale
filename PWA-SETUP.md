# PWA Setup Guide

Your Hope Vale website is now a Progressive Web App (PWA)!

## What Was Added

1. **Service Worker** - Enables offline functionality and caching
2. **Web App Manifest** - Allows installation on mobile devices
3. **App Icons** - (Need to be added - see below)

## Files Changed

- `next.config.ts` - Added PWA plugin configuration
- `app/layout.tsx` - Added PWA metadata
- `public/manifest.json` - App manifest with metadata
- `.gitignore` - Excluded auto-generated PWA files

## Required: Add App Icons

You need to create and add these icon files to the `/public` folder:

- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)
- `icon-192-maskable.png` (192x192 with padding for safe zone)
- `icon-512-maskable.png` (512x512 with padding for safe zone)

### Quick Way to Create Icons:
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload a square logo (at least 512x512)
3. Download all generated icons
4. Place them in `/public` folder

## Testing the PWA

### On Desktop (Chrome/Edge):
1. Run `npm run build && npm start`
2. Open http://localhost:3000 in Chrome
3. Look for an install icon in the address bar
4. Click "Install" to add to your desktop

### On Mobile (iOS Safari):
1. Deploy to your production site
2. Visit the site in Safari
3. Tap the Share button
4. Tap "Add to Home Screen"
5. The app will appear as an icon on your home screen

### On Mobile (Android Chrome):
1. Deploy to your production site
2. Visit the site in Chrome
3. Tap the menu and select "Add to Home Screen"
4. Or tap the install banner that appears

## Features Enabled

- **Installable** - Users can add to home screen
- **Offline Ready** - Service worker caches pages
- **Fast Loading** - Cached assets load instantly
- **App-like** - Runs in standalone mode without browser chrome
- **Auto-updates** - Service worker updates automatically

## Deployment

When you're ready to deploy:

1. Commit changes: `git add . && git commit -m "Add PWA support"`
2. Merge to main: `git checkout main && git merge pwa-implementation`
3. Push to production: `git push`

Your hosting platform (Vercel/Netlify) will rebuild with PWA enabled.

## Customization

Edit `public/manifest.json` to customize:
- `name` - Full app name
- `short_name` - Name on home screen
- `theme_color` - Browser toolbar color
- `background_color` - Splash screen color
