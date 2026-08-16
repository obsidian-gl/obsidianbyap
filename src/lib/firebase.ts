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

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
provider.addScope('https://www.googleapis.com/auth/user.addresses.read');
provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');
provider.addScope('profile');
provider.addScope('email');

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
    
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    
    cachedAccessToken = credential.accessToken;
    
    // Auto-save user profile to Firestore
    try {
      let birthday = '';
      let address = '';
      let phone = result.user.phoneNumber || '';

      try {
        const peopleRes = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays,addresses,phoneNumbers', {
          headers: { Authorization: `Bearer ${cachedAccessToken}` }
        });
        const peopleData = await peopleRes.json();
        
        if (peopleData.birthdays && peopleData.birthdays.length > 0) {
          const b = peopleData.birthdays[0].date;
          if (b && b.year && b.month && b.day) {
            birthday = `${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`;
          }
        }
        if (peopleData.addresses && peopleData.addresses.length > 0) {
          address = peopleData.addresses[0].formattedValue || '';
        }
        if (!phone && peopleData.phoneNumbers && peopleData.phoneNumbers.length > 0) {
          phone = peopleData.phoneNumbers[0].value || '';
        }
      } catch (err) {
        console.warn("Could not fetch additional data from People API", err);
      }

      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
        phone: phone,
        address: address,
        birthday: birthday,
        role: result.user.email === 'akshatpopat9311@gmail.com' ? 'admin' : 'user'
      }, { merge: true });

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

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    if (error.code === 'auth/unauthorized-domain') {
      alert(`Domain not authorized! Please add your Vercel domain to Firebase Console -> Authentication -> Settings -> Authorized domains.`);
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.log('Sign-in cancelled by user.');
    } else {
      alert(`Sign in error: ${error.message || 'Please ensure your domain is authorized in Firebase and Google Cloud.'}`);
    }
    
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  
  if (auth.currentUser) {
    const wantsReauth = window.confirm("You need to grant permission to schedule events and send emails. Sign in again to authorize Google APIs?");
    if (wantsReauth) {
      const res = await googleSignIn();
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
