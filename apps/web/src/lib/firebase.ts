import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock-auth-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock-storage-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'mock-sender-id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'mock-app-id',
};

const missingFirebaseConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingFirebaseConfig.length > 0) {
  console.warn('[Firebase Client] Missing Firebase web config keys:', missingFirebaseConfig);
}

// Initialize Firebase app (Singleton)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Executes a popup Google Authentication flow
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.info('[Auth] Google login success:', {
      uid: result.user.uid,
      email: result.user.email,
    });

    const token = await result.user.getIdToken();
    console.info('[Auth] Firebase ID token generated:', {
      uid: result.user.uid,
      tokenLength: token.length,
    });

    return { user: result.user, token };
  } catch (error: any) {
    console.error('Firebase Google Sign-In Error:', error);
    throw error;
  }
};

/**
 * Standard Sign out helper
 */
export const logoutFromFirebase = async () => {
  await signOut(auth);
};
