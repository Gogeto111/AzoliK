# Azolik Deployment Guide

## Quick Deploy to Vercel (Recommended)

### 1. Push to GitHub
```bash
cd azolik
git init
git add .
git commit -m "Initial commit: Azolik Business OS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/azolik.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel auto-detects Vite configuration
5. Click "Deploy" - no configuration needed!

### 3. Custom Domain (Optional)
- In Vercel project settings → Domains
- Add your custom domain
- Vercel handles SSL automatically

---

## Alternative: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Or connect GitHub repo in Netlify dashboard (auto-detects Vite).

---

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript;
}
```

### Build & Run
```bash
docker build -t azolik .
docker run -p 80:80 azolik
```

---

## GitHub Pages

### 1. Enable GitHub Pages
- Repository Settings → Pages
- Source: GitHub Actions

### 2. Create `.github/workflows/deploy.yml`
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

---

## Environment Variables

Create `.env` for local development:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://ws.yourdomain.com
```

For production, set in Vercel/Netlify dashboard under Environment Variables.

---

## Mobile App (Capacitor)

### 1. Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init azolik com.azolik.app
```

### 2. Build & Sync
```bash
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

### 3. Open in IDE
```bash
# iOS
npx cap open ios

# Android
npx cap open android
```

### 4. Build for App Store / Play Store
- **iOS**: Open Xcode → Product → Archive → Distribute App
- **Android**: Build → Generate Signed Bundle/APK

---

## PWA Configuration

The app includes:
- ✅ `manifest.json` - Installable PWA
- ✅ `sw.js` - Service Worker for offline support
- ✅ `icons` - PWA icons (192px, 512px)
- ✅ Service Worker caching strategy

### Install Prompt
The app automatically shows install prompt on supported browsers.

---

## Performance Checklist

- [x] Code splitting with dynamic imports
- [x] Asset optimization (Vite)
- [x] Cache-Control headers for static assets
- [x] Gzip/Brotli compression (handled by Vercel/Netlify)
- [x] Tree shaking (ES modules)
- [x] Minification (esbuild/rolldown)

---

## Monitoring & Analytics

Add to `index.html`:
```html
<!-- Vercel Analytics -->
<script defer src="/_vercel/insights/script.js"></script>

<!-- Or Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Security Headers (configured in vercel.json)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- CSP can be added for stricter control

---

## Troubleshooting

### Build fails
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Routing issues (404 on refresh)
Ensure `vercel.json` has SPA rewrite:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### PWA not installing
- Check manifest.json is accessible
- Ensure HTTPS (required for PWA)
- Verify service worker registers in DevTools → Application

---

## Support

For issues:
1. Check build logs
2. Verify Node.js version (20+)
3. Clear caches and reinstall
4. Check Vercel/Netlify deployment logs