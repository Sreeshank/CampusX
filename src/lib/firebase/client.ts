// Person 2: use after completing FIREBASE_HANDOFF.md. Not initialized by the demo.
import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
let services: ReturnType<typeof initializeServices> | undefined;
function initializeServices() {
  const e = import.meta.env;
  if (
    !e.VITE_FIREBASE_API_KEY ||
    !e.VITE_FIREBASE_PROJECT_ID ||
    !e.VITE_FIREBASE_APP_ID
  )
    throw new Error("Fill the Firebase web configuration first.");
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: e.VITE_FIREBASE_API_KEY,
      authDomain: e.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: e.VITE_FIREBASE_PROJECT_ID,
      storageBucket: e.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: e.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: e.VITE_FIREBASE_APP_ID,
    });
  const auth = getAuth(app),
    db = getFirestore(app),
    storage = getStorage(app),
    functions = getFunctions(app, e.VITE_FUNCTIONS_REGION || "asia-south1");
  if (e.VITE_USE_EMULATORS === "true") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  }
  return { auth, db, storage, functions };
}
export function getFirebaseServices() {
  return (services ??= initializeServices());
}
