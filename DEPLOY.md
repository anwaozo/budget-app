# Deploy Home Budget OS

## Option A — Vercel (Recommended, Free)

1. Go to **vercel.com** → Sign in with GitHub
2. Click **"Add New Project"**
3. Import **`anwaozo/budget-app`** from GitHub
4. Settings (auto-detected):
   - Framework: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Click **Deploy**

Every future `git push` to `main` auto-deploys. ✅

Your app will be live at: `https://home-budget-os.vercel.app` (or custom domain)

---

## Option B — Netlify (Also Free)

1. Go to **netlify.com** → Sign in with GitHub
2. Click **"Add new site" → "Import an existing project"**
3. Connect GitHub → select `anwaozo/budget-app`
4. Settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Click **Deploy site**

---

## Option C — Vercel CLI (if you have a token)

```bash
cd budgethome
npm i -g vercel
vercel login
vercel --prod
```

---

## Mobile / PWA Installation

Once deployed, users can install as a PWA:

**iPhone (Safari):**
1. Open the app URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add" → appears as native app icon

**Android (Chrome):**
1. Open the app URL in Chrome
2. Tap the 3-dot menu
3. Tap "Add to Home Screen" or "Install App"

The app runs in standalone mode (no browser chrome), uses your device's safe area insets, and respects dark/light mode automatically.
