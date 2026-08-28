import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { app } from './config';

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize providers
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

// Export standard Auth wrapper functions for clean reusability
export const registerUser = createUserWithEmailAndPassword;
export const loginUser = signInWithEmailAndPassword;
export const logoutUser = signOut;
export const resetPassword = sendPasswordResetEmail;
export const observeAuthState = onAuthStateChanged;
