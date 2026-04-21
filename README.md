# goknote

A personal web app for noting song arrangements, instrument structures, and section nuances while studying music composition.

**Live**: https://ibare.github.io/goknote/

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Anonymous Authentication** under Authentication → Sign-in methods.
3. Create a **Firestore Database** in production mode.
4. Apply the following security rules in Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{doc=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. In Project Settings → Your apps, register a Web app and copy the config values.

---

## Environment Variables

Copy the Firebase config values into `.env.local` (never commit this file):

```
VITE_FB_API_KEY=your-api-key
VITE_FB_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FB_PROJECT_ID=your-project-id
VITE_FB_STORAGE_BUCKET=your-project.appspot.com
VITE_FB_SENDER_ID=your-sender-id
VITE_FB_APP_ID=your-app-id
```

---

## Local Development

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173/goknote/

---

## Build

```bash
npm run build
```

Output goes to `dist/`.

---

## Deploy to GitHub Pages

```bash
npm run deploy
```

This builds the project and pushes `dist/` to the `gh-pages` branch. Make sure the repository's GitHub Pages source is set to the `gh-pages` branch.

---

## Tech Stack

- Vite 5 + React 18 + TypeScript 5
- Tailwind CSS 3
- Framer Motion (animations)
- @dnd-kit (drag & drop)
- react-router-dom v6 with HashRouter
- Zustand (global state)
- Firebase (Firestore + Anonymous Auth)
- Phosphor Icons
- Pretendard Variable font
