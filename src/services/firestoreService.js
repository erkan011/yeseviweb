import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

export const getBoxesByKurum = async (kurumId) => {
  if (!kurumId) return [];
  const q = query(collection(db, 'boxes'), where('kurum_id', '==', kurumId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getStaffByKurum = async (kurumId) => {
  if (!kurumId) return [];
  const q = query(collection(db, 'users'), where('kurum_id', '==', kurumId));
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

// ========================================
// Personel Düzenleme
// ========================================

/**
 * Firestore users koleksiyonunda personel bilgilerini günceller.
 */
export const updateUserDocument = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    guncelleme_tarihi: Timestamp.now(),
  });
};

// ========================================
// Super Admin - Global İstatistikler
// ========================================

/**
 * Süper yönetici için tüm sistemdeki global istatistikleri döndürür.
 */
export const getSuperAdminStats = async () => {
  const [kurumlarSnap, usersSnap, kutularSnap] = await Promise.all([
    getDocs(collection(db, 'kurumlar')),
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'boxes')),
  ]);

  const toplamKurum = kurumlarSnap.size;
  const toplamPersonel = usersSnap.docs.filter(d => {
    const rol = d.data().rol;
    return rol !== 'super_admin';
  }).length;
  const aktifPersonel = usersSnap.docs.filter(d => {
    const data = d.data();
    return data.rol !== 'super_admin' && data.durum !== 'Pasif';
  }).length;
  const toplamKutu = kutularSnap.size;
  const aktifKutu = kutularSnap.docs.filter(d => d.data().durum === 'Aktif').length;
  const hasarliKutu = kutularSnap.docs.filter(d => d.data().durum === 'Hasarlı').length;

  return {
    toplamKurum,
    toplamPersonel,
    aktifPersonel,
    toplamKutu,
    aktifKutu,
    hasarliKutu,
  };
};

// ========================================
// İhtiyaç Sahipleri (Beneficiaries)
// ========================================

export const getBeneficiariesByKurum = async (kurumId) => {
  if (!kurumId) return [];
  const q = query(collection(db, 'beneficiaries'), where('kurum_id', '==', kurumId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addBeneficiary = async (data) => {
  const docRef = await addDoc(collection(db, 'beneficiaries'), {
    ...data,
    olusturma_tarihi: Timestamp.now(),
  });
  return docRef.id;
};

export const updateBeneficiary = async (id, data) => {
  const ref = doc(db, 'beneficiaries', id);
  await updateDoc(ref, {
    ...data,
    guncelleme_tarihi: Timestamp.now(),
  });
};

// ========================================
// Login - Kurum Doğrulama
// ========================================

/**
 * Kurum adı veya kodu ile kurum dokümanını bulur.
 */
export const getOrganizationByField = async (value) => {
  if (!value) return null;
  const normalizedValue = value.trim().toLowerCase();

  // Önce kurum_kodu ile ara
  try {
    const byCode = query(collection(db, 'kurumlar'), where('kurum_kodu', '==', normalizedValue), limit(1));
    const codeSnap = await getDocs(byCode);
    if (!codeSnap.empty) {
      const d = codeSnap.docs[0];
      return { id: d.id, ...d.data() };
    }
  } catch { /* indeks yoksa devam et */ }

  // kurum_adi ile ara (case-insensitive yapılamaz, exact match)
  try {
    const byName = query(collection(db, 'kurumlar'), where('kurum_adi', '==', value.trim()), limit(1));
    const nameSnap = await getDocs(byName);
    if (!nameSnap.empty) {
      const d = nameSnap.docs[0];
      return { id: d.id, ...d.data() };
    }
  } catch { /* devam et */ }

  return null;
};

// ========================================
// Yardımcı Fonksiyonlar
// ========================================

const firstDocData = (snapshot) => {
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() };
};

/**
 * Auth kullanıcısının Firestore profilini çözer.
 * Önce users/{uid}, yoksa e-posta ile users, sonra personeller koleksiyonuna bakar.
 */
export const resolveUserProfile = async (firebaseUser) => {
  const uid = firebaseUser.uid;
  const email = firebaseUser.email || '';
  const uidRef = doc(db, 'users', uid);
  const uidSnap = await getDoc(uidRef);

  if (uidSnap.exists()) {
    return { uid, email: email || uidSnap.data().email, ...uidSnap.data() };
  }

  if (email) {
    try {
      const byEmail = query(collection(db, 'users'), where('email', '==', email), limit(1));
      const emailSnap = await getDocs(byEmail);
      const userByEmail = firstDocData(emailSnap);

      if (userByEmail) {
        const { id: _docId, ...profile } = userByEmail;
        try {
          await setDoc(uidRef, { ...profile, email }, { merge: true });
        } catch {
          // Profil yine kullanılabilir; UID belgesi yazılamasa da oturum açılır.
        }
        return { uid, email, ...profile };
      }

      const byPersonel = query(collection(db, 'personeller'), where('email', '==', email), limit(1));
      const personelSnap = await getDocs(byPersonel);
      const personel = firstDocData(personelSnap);

      if (personel) {
        return {
          uid,
          email,
          isim: personel.isim || personel.ad || firebaseUser.displayName || email,
          rol: personel.rol || 'saha_gorevlisi',
          kurum_id: personel.kurum_id,
        };
      }
    } catch {
      // Sorgular izin veya indeks nedeniyle başarısız olsa da oturum açık kalır.
    }
  }

  return {
    uid,
    email,
    isim: firebaseUser.displayName || email || 'Kullanıcı',
  };
};
