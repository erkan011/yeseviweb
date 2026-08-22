import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

export const getBoxesByKurum = async (kurumId) => {
  if (!kurumId) return [];
  const q = query(collection(db, 'kutular'), where('kurum_id', '==', kurumId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getStaffByKurum = async (kurumId) => {
  if (!kurumId) return [];
  const q = query(collection(db, 'personeller'), where('kurum_id', '==', kurumId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getActivitiesByKurum = async (kurumId) => {
  if (!kurumId) return [];
  const q = query(
    collection(db, 'aktiviteler'), 
    where('kurum_id', '==', kurumId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getMonthlyCollectionsByKurum = async (kurumId) => {
  if (!kurumId) return [];
  const q = query(
    collection(db, 'toplamalar'), 
    where('kurum_id', '==', kurumId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ========================================
// Super Admin - Kurum Yönetimi
// ========================================

export const getAllOrganizations = async () => {
  const snapshot = await getDocs(collection(db, 'kurumlar'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createOrganization = async (data) => {
  const docRef = await addDoc(collection(db, 'kurumlar'), {
    kurum_adi: data.kurum_adi,
    kutu_limiti: Number(data.kutu_limiti) || 50,
    durum: 'aktif',
    olusturma_tarihi: Timestamp.now(),
  });
  return docRef.id;
};

/**
 * Firestore users koleksiyonuna yeni admin dokümanı oluşturur.
 * Doküman ID'si olarak Firebase Auth UID kullanılır.
 */
export const createUserDocument = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    email: data.email,
    isim: data.isim,
    rol: 'admin',
    kurum_id: data.kurum_id,
    olusturma_tarihi: Timestamp.now(),
  });
};
