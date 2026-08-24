import { auth, secondaryAuth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';

export const loginWithEmail = async (email, password, rememberMe = true) => {
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  );
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
