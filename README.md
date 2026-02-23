# 🌐 Global Chat — Deploy to Vercel

A public real-time chat room. No login needed — just pick a name and start talking.
Built with **Next.js** + **Firebase Firestore**.

---

## 🚀 Deploy in 4 Steps

### Step 1 — Set up Firebase

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it anything (e.g. `global-chat`) → Create
3. In your project, click the **web icon (</>)** to add a web app → Register app
4. Copy the `firebaseConfig` values — you'll need them in Step 3

**Set up Firestore:**
- In the Firebase sidebar: **Build → Firestore Database → Create database**
- Choose **"Start in test mode"** (allows public read/write — fine for open chat)
- Pick any region → Enable

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/global-chat.git
git push -u origin main
```

### Step 3 — Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com) → **"Add New Project"**
2. Import your GitHub repo
3. Before deploying, click **"Environment Variables"** and add these 6 vars (from Step 1):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | from Firebase config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | from Firebase config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | from Firebase config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | from Firebase config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | from Firebase config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | from Firebase config |

4. Click **Deploy** 🎉

### Step 4 — Done!

Vercel gives you a live URL like `https://global-chat-xyz.vercel.app`.
Share it with anyone — all visitors share the same real-time chat.

---

## 💻 Run Locally

```bash
cp .env.example .env.local
# Fill in your Firebase values in .env.local

npm install
npm run dev
# Open http://localhost:3000
```

---

## 🔒 Locking Down Firestore (Optional)

When you're ready to tighten security, replace Firestore rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read: if true;
      allow create: if request.resource.data.text is string
                    && request.resource.data.text.size() <= 500
                    && request.resource.data.user is string
                    && request.resource.data.user.size() <= 20;
    }
  }
}
```

This lets anyone read and send messages, but validates the shape of data.

---

## 🗂 Project Structure

```
├── app/
│   ├── layout.js        # Root layout
│   ├── page.js          # Home page
│   └── globals.css      # Global styles
├── components/
│   └── ChatRoom.js      # Main chat UI + Firebase logic
├── lib/
│   └── firebase.js      # Firebase initialization
├── .env.example         # Template for environment variables
└── package.json
```
