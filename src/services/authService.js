import { auth, secondaryAuth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

export const loginWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * İkincil auth instance üzerinden yeni kullanıcı oluşturur.
 * Super admin'in oturumu korunur.
 * @returns {string} Yeni oluşturulan kullanıcının UID'si
 */
export const createAdminUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  // İkincil instance'ın oturumunu temizle
  await signOut(secondaryAuth);
  return userCredential.user.uid;
};
