# 💬 Chat App — React + Firebase

A real-time chat application built with React, Vite, and Firebase.

---

## 🚀 How to Run

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Add your Firebase config
Open `src/config/firebase.js` and paste your Firebase project config:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

> Get this from: Firebase Console → Your Project → Project Settings → Your Apps

### Step 3 — Start the app
```bash
npm run dev
```
Open **http://localhost:5173**

---

## 🔥 Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password
4. Create a **Firestore Database** (start in test mode)
5. Enable **Storage** (for image uploads)
6. Copy your config into `src/config/firebase.js`

### Firestore Rules (paste in Firebase Console → Firestore → Rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## ☁️ Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or push to GitHub and import at [vercel.com](https://vercel.com) — it auto-detects Vite.

---

## ✅ Bugs Fixed in This Version

| Bug | Location | Fix |
|-----|----------|-----|
| `auth.chatUser` → should be `auth.currentUser` | AppContext.jsx | Fixed |
| `setChat` called before definition | LeftSidebar.jsx | Moved definition above `addChat` |
| Time showed `3:9 PM` instead of `3:09 PM` | ChatBox.jsx | Added `padStart(2, '0')` |
| Redundant polling interval | AppContext.jsx | Removed duplicate setInterval |
| `onAuthStateChanged` not unsubscribed | App.jsx | Added cleanup `return () => unSub()` |
| Image input not reset after send | ChatBox.jsx | Added `e.target.value = ''` |
