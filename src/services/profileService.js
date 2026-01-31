// Profile service: read/write user profile and emergency contacts in Firestore
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import app from '../firebase/firebaseConfig';

const db = getFirestore(app);

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error('getUserProfile error', error);
    throw error;
  }
};

export const setUserProfile = async (uid, data) => {
  if (!uid) throw new Error('Missing uid');
  try {
    const ref = doc(db, 'users', uid);
    await setDoc(ref, data, { merge: true });
    return true;
  } catch (error) {
    console.error('setUserProfile error', error);
    throw error;
  }
};

export default {
  getUserProfile,
  setUserProfile,
};