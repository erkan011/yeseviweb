import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { createAdminUser } from '../services/authService';
import { updateUserDocument } from '../services/firestoreService';

// ---------- Add Staff Modal ----------
const AddStaffModal = ({ isOpen, onClose, user, onStaffAdded }) => {
  const [formData, setFormData] = useState({
    adSoyad: '', telefon: '', email: '', rol: 'saha_gorevlisi', durum: 'Aktif', sifre: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if(!formData.adSoyad || !formData.email || !formData.sifre) {
       return alert("Lütfen gerekli alanları doldurun.");
    }
    // Aktif kullanıcının kurum kimliği yoksa (örneğin Super Admin hesabıysa), 
    // test edilebilmesi için varsayılan bir kurum ID atıyoruz.
    const activeKurumId = user?.kurum_id || 'merkez_kurum';

    setLoading(true);
    try {
       const newUid = await createAdminUser(formData.email, formData.sifre);
       await setDoc(doc(db, 'users', newUid), {
         ad: formData.adSoyad,
         isim: formData.adSoyad,
         email: formData.email,
         telefon: formData.telefon,
         rol: formData.rol,
         durum: formData.durum,
         kurum_id: activeKurumId,
         atananKutu: 0,
         createdAt: new Date().toISOString()
       });
       onStaffAdded();
       onClose();
       setFormData({ adSoyad: '', telefon: '', email: '', rol: 'saha_gorevlisi', durum: 'Aktif', sifre: '' });
    } catch(err) {
       console.error(err);
       alert("Personel eklenirken hata: " + err.message);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-[scaleIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h3 className="text-lg font-semibold text-surface-900">Yeni Personel Ekle</h3>
          <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Ad Soyad</label>
              <input value={formData.adSoyad} onChange={e => setFormData({...formData, adSoyad: e.target.value})} type="text" placeholder="Ahmet Yılmaz" className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Telefon</label>
              <input value={formData.telefon} onChange={e => setFormData({...formData, telefon: e.target.value})} type="tel" placeholder="0532 111 2233" className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">E-posta Adresi</label>
            <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" placeholder="ornek@yesevi.org" className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Rol</label>
              <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                <option value="saha_gorevlisi">Saha Personeli</option>
                <option value="saha_sorumlusu">Saha Sorumlusu</option>
                <option value="admin">Yönetici</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Durum</label>
              <select value={formData.durum} onChange={e => setFormData({...formData, durum: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                <option value="Aktif">Aktif</option>
                <option value="Pasif">Pasif</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Geçici Şifre</label>
            <input value={formData.sifre} onChange={e => setFormData({...formData, sifre: e.target.value})} type="password" placeholder="••••••••" className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
            <p className="text-xs text-surface-400">Personel ilk girişte şifresini değiştirecektir.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-100">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer disabled:opacity-50">
            İptal
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all cursor-pointer disabled:opacity-50">
            {loading ? 'Ekleniyor...' : 'Personel Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Edit Staff Modal ----------
const EditStaffModal = ({ isOpen, onClose, staffData, onStaffUpdated }) => {
  const [formData, setFormData] = useState({
    adSoyad: '', telefon: '', rol: 'saha_gorevlisi', durum: 'Aktif'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staffData) {
      setFormData({
        adSoyad: staffData.isim || staffData.ad || '',
        telefon: staffData.telefon || '',
        rol: staffData.rol || 'saha_gorevlisi',
        durum: staffData.durum || 'Aktif',
      });
    }
  }, [staffData]);

  if (!isOpen || !staffData) return null;

  const handleSubmit = async () => {
    if (!formData.adSoyad) {
      return alert('Lütfen ad soyad alanını doldurun.');
    }
    setLoading(true);
    try {
      await updateUserDocument(staffData.id, {
        ad: formData.adSoyad,
        isim: formData.adSoyad,
        telefon: formData.telefon,
        rol: formData.rol,
        durum: formData.durum,
      });
      onStaffUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Personel güncellenirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-[scaleIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h3 className="text-lg font-semibold text-surface-900">Personel Düzenle</h3>
          <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Ad Soyad</label>
            <input value={formData.adSoyad} onChange={e => setFormData({...formData, adSoyad: e.target.value})} type="text" className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Telefon</label>
            <input value={formData.telefon} onChange={e => setFormData({...formData, telefon: e.target.value})} type="tel" placeholder="0532 111 2233" className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Rol</label>
              <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                <option value="saha_gorevlisi">Saha Personeli</option>
                <option value="saha_sorumlusu">Saha Sorumlusu</option>
                <option value="admin">Yönetici</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Durum</label>
              <select value={formData.durum} onChange={e => setFormData({...formData, durum: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all">
                <option value="Aktif">Aktif</option>
                <option value="Pasif">Pasif</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-100">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer disabled:opacity-50">
            İptal
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all cursor-pointer disabled:opacity-50">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
//  STAFF PAGE
// ============================================================
const StaffPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState('Tümü');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStaffData, setEditStaffData] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    const activeKurumId = user?.kurum_id || 'merkez_kurum';
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'), 
        where('kurum_id', '==', activeKurumId)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setStaff(items);
    } catch (error) {
      console.error("Personeller yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [user]);

  const handleDelete = async (staffId) => {
    if (!window.confirm("Bu personeli silmek istediğinize emin misiniz?")) return;
    try {
      await deleteDoc(doc(db, 'users', staffId));
      setStaff(prev => prev.filter(s => s.id !== staffId));
      // Optional: alert or toast success
    } catch (e) {
      console.error("Personel silinemedi:", e);
      alert("Silme işlemi başarısız.");
    }
  };

  const filteredStaff = staff.filter((s) => {
    const ad = s.isim || s.ad || '';
    const email = s.email || '';
    
    const matchesSearch =
      ad.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase());
      
    // Rol mapping adjustment for mapping UI to DB values if needed
    let sRol = s.rol || 'Personel';
    if(s.rol === 'admin') sRol = 'Yönetici';
    if(s.rol === 'saha_gorevlisi') sRol = 'Saha Personeli';

    const matchesRole = filterRol === 'Tümü' || sRol.includes(filterRol) || filterRol.includes(sRol);
    return matchesSearch && matchesRole;
  });

  const rolBadge = (rol) => {
    const map = {
      'Saha Personeli': 'bg-blue-50 text-blue-700 ring-blue-600/20',
      'Saha Sorumlusu': 'bg-purple-50 text-purple-700 ring-purple-600/20',
      'Yönetici': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${map[rol] || ''}`}>
        {rol}
      </span>
    );
  };

  const durumBadge = (durum) => (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${durum === 'Aktif' ? 'text-green-700' : 'text-surface-400'}`}>
      <span className={`w-2 h-2 rounded-full ${durum === 'Aktif' ? 'bg-green-500' : 'bg-surface-300'}`} />
      {durum}
    </span>
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-surface-900">Personel Yönetimi</h2>
          <p className="text-sm text-surface-400 mt-0.5">Sahada görev yapan tüm personelleri yönetin</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Yeni Personel Ekle
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-surface-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900">{staff.length}</p>
            <p className="text-sm text-surface-400">Toplam Personel</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 ring-1 ring-green-100 flex items-center justify-center text-green-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900">{staff.filter(s => (s.durum !== 'Pasif')).length}</p>
            <p className="text-sm text-surface-400">Aktif Personel</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 ring-1 ring-purple-100 flex items-center justify-center text-purple-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900">{staff.reduce((t, s) => t + (s.atananKutu || 0), 0)}</p>
            <p className="text-sm text-surface-400">Atanmış Kutu</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-surface-200 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Ad, e-posta veya ID ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-700 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        </div>
        <select
          value={filterRol}
          onChange={(e) => setFilterRol(e.target.value)}
          className="px-3 py-2 rounded-lg border border-surface-200 bg-surface-50 text-sm text-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option>Tümü</option>
          <option>Saha Personeli</option>
          <option>Saha Sorumlusu</option>
          <option>Yönetici</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Personel</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">İletişim</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Rol</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Durum</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Atanan Kutu</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">Son Aktivite</th>
                <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-6 py-4">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {!loading && filteredStaff.map((p) => {
                const sName = p.isim || p.ad || 'Bilinmiyor';
                let sRol = p.rol || 'Personel';
                if(sRol === 'admin') sRol = 'Yönetici';
                if(sRol === 'saha_gorevlisi') sRol = 'Saha Personeli';
                
                return (
                <tr key={p.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {sName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-800">{sName}</p>
                        <p className="text-xs text-surface-400">{p.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-surface-700">{p.email}</p>
                    <p className="text-xs text-surface-400">{p.telefon || '-'}</p>
                  </td>
                  <td className="px-6 py-4">{rolBadge(sRol)}</td>
                  <td className="px-6 py-4">{durumBadge(p.durum || 'Aktif')}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-surface-700">{p.atananKutu || 0}</span>
                    <span className="text-xs text-surface-400 ml-1">kutu</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">{p.sonAktivite || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditStaffData(p); setShowEditModal(true); }} className="p-1.5 rounded-lg text-surface-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer" title="Düzenle">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-surface-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer" title="Sil">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-surface-100 flex items-center justify-between">
          <p className="text-sm text-surface-400">
            Toplam <span className="font-medium text-surface-700">{filteredStaff.length}</span> personel gösteriliyor
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg text-sm text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer">Önceki</button>
            <button className="px-3 py-1.5 rounded-lg text-sm bg-primary-600 text-white cursor-pointer">1</button>
            <button className="px-3 py-1.5 rounded-lg text-sm text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer">Sonraki</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddStaffModal isOpen={showModal} onClose={() => setShowModal(false)} user={user} onStaffAdded={fetchStaff} />
      <EditStaffModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditStaffData(null); }} staffData={editStaffData} onStaffUpdated={fetchStaff} />
    </div>
  );
};

export default StaffPage;
