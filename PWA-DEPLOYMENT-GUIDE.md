# TheKissanCity PWA Deployment Guide

This guide will help you deploy your Progressive Web App (PWA) and prepare it for Google Play Store using Trusted Web Activity (TWA).

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development & Testing](#local-development--testing)
3. [Production Deployment](#production-deployment)
4. [Google Play Store Setup](#google-play-store-setup)
5. [TWA Configuration](#twa-configuration)
6. [Manual Steps Checklist](#manual-steps-checklist)
7. [Troubleshooting](#troubleshooting)

## 🚀 Prerequisites

### Required Tools
- Node.js (v16 or higher)
- npm or yarn
- Google Chrome (for testing)
- Android Studio (for TWA building)
- Google Play Console account

### Required Dependencies
```bash
npm install sharp  # For icon generation
```

### Required Files
Ensure you have these files in your project:
- `public/icon-512.png` (your main app icon, 512x512px)
- `public/manifest.json` (PWA manifest)
- `public/.well-known/assetlinks.json` (Digital Asset Links)
- `public/privacy-policy.html` (Privacy policy)

## 🛠️ Local Development & Testing

### 1. Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:8082`

### 2. Test PWA Functionality
Open Chrome DevTools and check:

**Application Tab:**
- ✅ Service Worker is registered and active
- ✅ Manifest is valid
- ✅ All icons are accessible
- ✅ Cache storage is working

**Console:**
- ✅ No PWA-related errors
- ✅ Service worker registration successful

**Lighthouse:**
```bash
npm run pwa:audit
```
- ✅ PWA score should be 90+
- ✅ Installable criteria met

### 3. Test Install Prompt
- Use desktop Chrome: Look for install icon in address bar
- Use mobile Chrome: Check if install prompt appears after 5 seconds
- Test both native install and manual instructions

### 4. Generate Icons (if needed)
```bash
npm install sharp
npm run pwa:generate-icons
```

## 🌐 Production Deployment

### 1. Build for Production
```bash
npm run build:pwa
```

### 2. Test Production Build
```bash
npm run preview:pwa
```
Test at `http://localhost:4173`

### 3. Deploy to Your Server
Upload the `dist/` folder to your web server with HTTPS required.

**Server Requirements:**
- ✅ HTTPS certificate
- ✅ Proper MIME types for `.webmanifest`
- ✅ Service worker files served correctly

**Nginx Configuration Example:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control 'no-cache';
}

location ~* \.(webmanifest|js|css|png|jpg|jpeg|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /sw.js {
    add_header Cache-Control 'no-cache, no-store, must-revalidate';
}
```

## 📱 Google Play Store Setup

### 1. Create Google Play Console Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Pay the $25 developer fee
3. Create a new application

### 2. App Details
- **App Name:** TheKissanCity
- **Package Name:** `com.TheKissanCity.app`
- **Category:** Shopping
- **Content Rating:** Everyone

### 3. Store Listing
**App Description:**
```
TheKissanCity - Farm Fresh Goodness

Premium quality farm-fresh goods and lifestyle products delivered to your doorstep. 
Shop fresh produce, apparel, accessories, and more with our seamless mobile experience.

Features:
• Fresh farm products directly to your door
• Secure online payments
• Order tracking
• Exclusive deals and discounts
• Offline browsing capability
• Fast, native-like experience
```

**Screenshots Required:**
- Phone screenshots (at least 2): 320-3840px, 16:9 aspect ratio
- Tablet screenshots (optional): 600-7680px, 16:9 aspect ratio

### 4. App Content
- **Privacy Policy:** Link to `https://yourdomain.com/privacy-policy.html`
- **Content Guidelines:** Ensure compliance with Play Store policies

## 🔗 TWA Configuration

### 1. Install Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
```

### 2. Validate Your PWA
```bash
npm run pwa:validate
```

### 3. Generate TWA Project
```bash
bubblewrap init --manifest=https://yourdomain.com/manifest.json
```

### 4. Build APK
```bash
bubblewrap build
```

### 5. Sign APK
```bash
# Generate signing key
keytool -genkey -v -keystore thekissancity-release.keystore -alias thekissancity -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore thekissancity-release.keystore app-release-unsigned.apk thekissancity

# Optimize APK
zipalign -v 4 app-release-unsigned.apk thekissancity-release.apk
```

### 6. Upload to Play Console
1. Go to "Release" → "Production" → "Create new release"
2. Upload `thekissancity-release.apk`
3. Add release notes
4. Submit for review

## 📋 Manual Steps Checklist

### Before Deployment
- [ ] HTTPS certificate is installed and valid
- [ ] All PWA icons are generated and accessible
- [ ] Manifest.json is valid and complete
- [ ] Service worker is working correctly
- [ ] Privacy policy page is accessible
- [ ] Digital Asset Links file is configured

### Testing Checklist
- [ ] PWA installs correctly on desktop Chrome
- [ ] PWA installs correctly on mobile Chrome
- [ ] Offline functionality works
- [ ] Push notifications (if implemented) work
- [ ] All app shortcuts function correctly
- [ ] Lighthouse audit score is 90+

### Google Play Store
- [ ] Google Play Console account created
- [ ] App listing completed with all required fields
- [ ] Screenshots captured and uploaded
- [ ] Privacy policy URL is accessible
- [ ] Content rating questionnaire completed
- [ ] Signing key generated and secured
- [ ] APK built and signed successfully
- [ ] APK uploaded to Play Console
- [ ] Store listing is complete and accurate

### Post-Deployment
- [ ] Monitor app performance and crashes
- [ ] Check user reviews and feedback
- [ ] Update app as needed
- [ ] Renew SSL certificate before expiration

## 🔧 Digital Asset Links Setup

### 1. Get SHA256 Fingerprint
```bash
keytool -list -v -keystore thekissancity-release.keystore -alias thekissancity
```

### 2. Update assetlinks.json
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.TheKissanCity.app",
    "sha256_cert_fingerprints":
    ["YOUR_SHA256_FINGERPRINT_HERE"]
  }
}]
```

### 3. Upload to Server
Place the file at: `https://yourdomain.com/.well-known/assetlinks.json`

### 4. Verify Asset Links
Test at: [Digital Asset Links Tool](https://developers.google.com/digital-asset-links/tools/generator)

## 🐛 Troubleshooting

### Common Issues

**Service Worker Not Registering**
- Check HTTPS is properly configured
- Verify service worker file is accessible
- Check browser console for errors

**Install Prompt Not Showing**
- Ensure site is served over HTTPS
- Check engagement criteria (30+ seconds or user interaction)
- Verify manifest is valid
- Check that user hasn't already installed

**Icons Not Loading**
- Verify all icon files exist in public folder
- Check file paths in manifest.json
- Ensure images are PNG format and correct sizes

**TWA Build Fails**
- Check manifest.json is accessible at the specified URL
- Verify all required icon sizes are present
- Ensure bubblewrap CLI is up to date

**Google Play Rejection**
- Review content policies carefully
- Ensure privacy policy is comprehensive
- Check that app functions as described
- Verify all required metadata is complete

### Debug Commands

```bash
# Check PWA validity
npm run pwa:validate

# Test build process
npm run build:pwa

# Run Lighthouse audit
npm run pwa:audit

# Check service worker registration
# Open Chrome DevTools → Application → Service Workers
```

## 📞 Support Resources

- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [Digital Asset Links](https://developers.google.com/digital-asset-links)

## 🔄 Maintenance

### Regular Tasks
- **Monthly:** Check SSL certificate expiration
- **Quarterly:** Run Lighthouse audit and optimize
- **As needed:** Update app content and features
- **Annually:** Renew signing key if needed

### Update Process
1. Update your web app
2. Build new version: `npm run build:pwa`
3. Create new TWA: `bubblewrap build`
4. Sign and upload to Play Console
5. Submit as new release

---

**🎉 Congratulations!** Your TheKissanCity PWA is now ready for deployment and Google Play Store submission!

For additional support, refer to the official documentation or contact the development team.
