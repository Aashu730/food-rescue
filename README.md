# Waste Food Management & Donation

Simple web application for donating and claiming surplus food.

Summary:
- Donation posting and listing (Household, Restaurant, Caterer, NGO)
- Real-time backend using Firebase Realtime Database
- Live driver tracking with Leaflet and Geolocation
- CSV audit export for NGO accepted donations

AI Scan: No AI/ML libraries or models were found in the codebase.

Quick start:
1. Install a local web server (e.g., use `Live Server` VS Code extension or `python -m http.server 8000`).
2. Copy your Firebase config into `config.js` (OR create a `config.js` from `config.example.js`).
3. Open `index.html` in the browser via the server.

Security note:
- `config.js` contains Firebase project keys; move sensitive config out of source control and use `config.example.js` as template and `config.js` in `.gitignore`.
- Configure Firebase Realtime Database rules before deploying to production.

Files of interest:
- `config.js` — Firebase initialization
- `feed.js`, `feed2.js`, `RestaurantPosting.js`, `NGO.js` — core donation flows
- `trackPickup.js`, `shareLocation.js` — live tracking and maps
- `core.min.js` — bundled jQuery
- `AI_scan_summary.html` — automated scan summary

How to publish to GitHub:
- Initialize git and commit (I did this locally if you asked me to), then create a repository on GitHub and push:

```bash
# create remote repo (use GitHub UI or `gh` CLI) then:
git remote add origin https://github.com/<your-username>/<repo>.git
git branch -M main
git push -u origin main
```

If you want, I can attempt to create the remote repo for you (requires GitHub CLI auth) or export this repo as a ZIP.
