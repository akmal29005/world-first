# The Map of Firsts

An interactive 3D globe visualization where users drop anonymous pins marking significant "firsts" in their lives (First Kiss, First Heartbreak, etc.).

## 🚀 Features

- **Interactive 3D Globe**: Built with D3.js and React. Supports rotation, zooming, and hover effects.
- **AI-Generated Content**: Uses Google Gemini API to populate the map with seed stories for a "lived-in" feel.
- **User Contributions**: Users can drop a pin on any country to add their own story.
- **Search & Filter**: Filter stories by category or search by keywords/location.
- **Responsive Design**: Glassmorphism UI that works on Desktop and Mobile.
- **Local Persistence**: User stories are saved to the browser's LocalStorage, so they persist after a refresh.

## 🛠 Setup & Run Locally

1. **Clone/Download** the repository.
2. **Install Dependencies** (if using a local bundler like Vite or Parcel):
   ```bash
   npm install
   ```
3. **Environment Variable**:
   Create a `.env` file (or set in your environment):
   ```
   API_KEY=your_google_gemini_api_key
   ```
4. **Run**:
   ```bash
   npm start
   ```

## ✅ Verification Checklist

To ensure the app is functioning correctly before publishing:

1. **Map Loading**: Verify the globe loads and countries are rendered. Hovering over a country should show a neon tooltip with the country name.
2. **Interactions**:
   - **Rotate**: Click and drag to rotate the globe.
   - **Zoom**: Scroll to zoom in/out.
   - **Pins**: Verify colored dots appear. Hovering/clicking them should open the Story Card.
3. **Adding a Story**:
   - Click **"Add Story"** (bottom bar).
   - Click a location on the globe.
   - Verify the **Country** field auto-fills in the form.
   - Submit the form and check if a new pin appears and "pulses".
   - **Refresh the page**: Verify the story you just added is still there.
4. **Search**: Type "Paris" or "Heartbreak" in the search bar. The pins on the globe should filter down to matches.
5. **Responsiveness**: Resize the browser to mobile width. Ensure the Filter Bar stacks correctly and the "Add Story" button is accessible.

## 📦 Deployment & Publishing

### 1. Build
Run the build command for your specific bundler:
```bash
npm run build
```

### 2. Hosting
This project can be deployed to static hosting providers like **Vercel**, **Netlify**, or **Cloudflare Pages**.

### 3. API Key Configuration
**Crucial**: You must set the `API_KEY` environment variable in your hosting provider's dashboard.
- **Netlify**: Site Settings > Build & Deploy > Environment variables.
- **Vercel**: Settings > Environment Variables.

> **⚠️ Security Note**: Storing API keys in a client-side application allows anyone with "Inspect Element" to view them. For production apps, it is highly recommended to proxy requests through a backend server (e.g., Netlify Functions, Vercel Functions) to keep your Gemini API key secret.

## 💾 Data Persistence Note
Currently, user stories are saved in **LocalStorage**. This means:
- If you refresh the page, your stories **will** reappear.
- However, **other users** on different computers will not see your stories yet.
- To enable global sharing, you would need to connect this frontend to a real-time database like Firebase or Supabase.

---

## 🌍 Making it Global (Backend Integration)

To allow users to see each other's pins, follow this guide to integrate **Firebase** (Free Tier is generous and sufficient for this app).

### Step 1: Setup Firebase
1. Go to [console.firebase.google.com](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Build > Firestore Database**.
3. Click **Create Database**.
   - Choose **Start in Test Mode** (for development) or **Production Mode** (you will need to configure security rules later).
   - Select a location near you.
4. Navigate to **Project Settings** (gear icon) > **General**.
5. Scroll down to "Your apps", select the **Web (</>)** icon.
6. Register the app (e.g., "MapOfFirsts").
7. Copy the `firebaseConfig` object provided.

### Step 2: Install Firebase SDK
In your project terminal run:
```bash
npm install firebase
```

### Step 3: Update `App.tsx`
Replace the LocalStorage logic with Firebase logic.

**1. Add Imports:**
```typescript
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

**2. Update `handleSaveStory` function:**
```typescript
const handleSaveStory = async (newStoryData: Omit<Story, 'id'>) => {
  try {
    // Save to Firestore
    const docRef = await addDoc(collection(db, "stories"), newStoryData);
    
    const newStory: Story = {
      ...newStoryData,
      id: docRef.id // Use Firebase ID
    };
    
    setStories(prev => [newStory, ...prev]);
    setNewPinLocation(null);
    setIsAddingMode(false);
    setSelectedStory(newStory);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
```

**3. Update `useEffect` to fetch from Firebase:**
```typescript
useEffect(() => {
  const init = async () => {
    setIsLoading(true);
    
    // 1. Fetch User Stories from Firestore
    try {
      const querySnapshot = await getDocs(collection(db, "stories"));
      const firebaseStories: Story[] = [];
      querySnapshot.forEach((doc) => {
        // Cast data to Story type safely
        firebaseStories.push({ id: doc.id, ...doc.data() } as Story);
      });
      setStories(prev => [...firebaseStories, ...prev]);
    } catch (error) {
      console.error("Error connecting to Firebase:", error);
    }

    // 2. Fetch AI Stories (Gemini) - Optional: You could also save these to DB
    try {
      const seed = await generateSeedStories(10);
      setStories(prev => [...prev, ...seed]); // Merge
    } catch (err) {
      console.error("Failed to load seed stories", err);
    } finally {
      setIsLoading(false);
    }
  };
  init();
}, []);
```
