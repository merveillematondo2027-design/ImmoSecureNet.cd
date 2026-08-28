import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { app } from './config';

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Google AI Studio often renders the app inside an embedded preview where
 * browser popup policies can reject signInWithPopup with auth/popup-blocked.
 * We keep popup as the preferred UX and transparently fall back to redirect.
 *
 * The redirect branch intentionally never resolves in the current page: the
 * browser is navigating to Google, then Firebase restores the session on the
 * return page and onAuthStateChanged takes over.
 */
export const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error?.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      return await new Promise<never>(() => {});
    }

    throw error;
  }
};

// Export standard Auth wrapper functions for clean reusability
export const registerUser = createUserWithEmailAndPassword;
export const loginUser = signInWithEmailAndPassword;
export const logoutUser = signOut;
export const resetPassword = sendPasswordResetEmail;
export const observeAuthState = onAuthStateChanged;
