import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXGDDy-012M3l9R8DkHQm6dtEMy9HP1oo",
  authDomain: "obsidian-27cf6.firebaseapp.com",
  projectId: "obsidian-27cf6",
  storageBucket: "obsidian-27cf6.firebasestorage.app",
  messagingSenderId: "836888630937",
  appId: "1:836888630937:web:a929778583638b95808a08",
  measurementId: "G-0SF04RGWF9"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const db = getFirestore(app, 'obsidian');
export const auth = getAuth(app);

// Normal provider for regular users (No scary scopes)
const provider = new GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');

// Admin provider for sending emails
const adminProvider = new GoogleAuthProvider();
adminProvider.addScope('https://www.googleapis.com/auth/gmail.send');
adminProvider.addScope('profile');
adminProvider.addScope('email');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    // Auto-save user profile to Firestore
    try {
      const userDocRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userDocRef);
      
      const userData: any = {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
        role: result.user.email === 'akshatpopat9311@gmail.com' ? 'admin' : 'user'
      };

      // Ensure we don't overwrite manual inputs if they already exist
      if (!userSnap.exists()) {
        userData.phone = '';
        userData.address = '';
        userData.birthday = '';
      }

      await setDoc(userDocRef, userData, { merge: true });

      // Auto-subscribe the user
      if (result.user.email) {
        const subscriberId = btoa(result.user.email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const subscriberDocRef = doc(db, 'subscribers', subscriberId);
        await setDoc(subscriberDocRef, {
          email: result.user.email,
          name: result.user.displayName || '',
          subscribedAt: new Date().toISOString(),
          status: 'active'
        }, { merge: true });
      }
    } catch (dbErr) {
      console.warn("Could not save user/subscription to Firestore. Make sure Firestore rules are deployed.", dbErr);
    }
    
    return { user: result.user, accessToken: credential?.accessToken || '' };
  } catch (error: any) {
    console.error('Sign in error:', error);
    if (error.code === 'auth/unauthorized-domain') {
      alert(`Domain not authorized! Please add your Vercel domain to Firebase Console -> Authentication -> Settings -> Authorized domains.`);
    } else if (error.code !== 'auth/popup-closed-by-user') {
      alert(`Sign in error: ${error.message}`);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const adminGoogleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, adminProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
       cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken || '' };
  } catch (error) {
    console.error("Admin sign in failed", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  
  if (auth.currentUser && auth.currentUser.email === 'akshatpopat9311@gmail.com') {
    const wantsReauth = window.confirm("Admin: You need to grant permission to send emails. Sign in again to authorize Google APIs?");
    if (wantsReauth) {
      const res = await adminGoogleSignIn();
      return res?.accessToken || null;
    }
  }
  return null;
};

export const logout = async () => {
  if (auth.currentUser?.email) {
    try {
      const subscriberId = btoa(auth.currentUser.email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      await setDoc(doc(db, 'subscribers', subscriberId), {
        status: 'unsubscribed',
        unsubscribedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Could not unsubscribe on logout", e);
    }
  }
  await signOut(auth);
  cachedAccessToken = null;
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
