import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  initializeFirestore,
  memoryLocalCache,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

/**
 * CRITICAL: Use memoryLocalCache instead of default IndexedDB persistence.
 * Default getFirestore() uses IndexedDB which frequently crashes or hangs
 * in Android WebViews. memoryLocalCache keeps everything in-memory.
 */
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

// Set persistence to local (survives tab close)
setPersistence(auth, browserLocalPersistence);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Detects if app is running inside Capacitor native shell.
 */
function isNativePlatform(): boolean {
  try {
    return !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

/**
 * Robust auth strategy:
 * 
 * 1. NATIVE (Capacitor APK): signInWithRedirect — popup is blocked in WebView.
 * 
 * 2. BROWSER (desktop + mobile): signInWithPopup — this works on modern
 *    mobile Chrome/Safari when triggered by a user click. If popup is
 *    blocked, we catch the error and fall back to redirect.
 * 
 * Why NOT signInWithRedirect for browsers?
 * Firebase stores redirect credentials on the authDomain origin
 * (firebaseapp.com). When the app runs on a different origin
 * (192.168.0.4, localhost), getRedirectResult() can't read them
 * due to cross-origin storage isolation → infinite login loop.
 */
export const signInWithGoogle = async () => {
  try {
    if (isNativePlatform()) {
      // Native WebView — popup is impossible, must use redirect
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    // All browser contexts — try popup first
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    const code = error?.code || '';

    // If popup was blocked by browser, fall back to redirect
    if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
      console.warn('[Auth] Popup blocked/closed, falling back to redirect...');
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    console.error("Firebase Sign-In Error:", code, error.message);
    throw error;
  }
};

export function handleFirestoreError(error: unknown, operationType: any, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

/**
 * Process pending redirect result (for native Capacitor fallback only).
 * Called on app startup to finalize any pending signInWithRedirect.
 */
export const handleRedirectResult = async (): Promise<boolean> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log('[Auth] Redirect sign-in successful:', result.user.email);
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('[Auth] Redirect result error:', error.code, error.message);
    return false;
  }
};
