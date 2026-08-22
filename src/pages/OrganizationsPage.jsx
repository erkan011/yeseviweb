import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllOrganizations, createOrganization, createUserDocument } from '../services/firestoreService';
import { createAdminUser } from '../services/authService';

// ========================================
// Skeleton Loader
// ========================================
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-surface-200 rounded-md w-3/4" />
      </td>
    ))}
  </tr>
);

// ========================================
// Status Badge
// ========================================
const StatusBadge = ({ status }) => {
  const config = {
    aktif: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Aktif' },
    pasif: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Pasif' },
    beklemede: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Beklemede' },
  };
  const s = config[status] || config.aktif;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ========================================
// Spinner Component
// ========================================
const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ========================================
// Add Organization Modal
// ========================================
const AddOrgModal = ({ isOpen, onClose, onSave, isSaving }) => {
  const [formData, setFormData] = useState({ kurum_adi: '', kutu_limiti: 50 });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kurum_adi.trim()) {
      setError('Kurum adı boş bırakılamaz.');
      return;
    }
    if (Number(formData.kutu_limiti) < 1) {
      setError('Kutu limiti en az 1 olmalıdır.');
      return;
    }
    await onSave(formData);
    setFormData({ kurum_adi: '', kutu_limiti: 50 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'scaleIn 0.25s ease-out' }}
      >
        <div className="px-6 py-5 border-b border-surface-100 bg-gradient-to-r from-primary-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-surface-900">Yeni Kurum Ekle</h3>
              <p className="text-sm text-surface-500 mt-0.5">Sisteme yeni bir dernek/kurum kaydedin.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-100 transition-colors text-surface-400 hover:text-surface-600 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="org-kurum-adi" className="block text-sm font-semibold text-surface-700 mb-1.5">
              Kurum Adı <span className="text-red-500">*</span>
            </label>
            <input
              id="org-kurum-adi"
              name="kurum_adi"
              type="text"
              placeholder="Örn: Yeşilyurt Yardımlaşma Derneği"
              value={formData.kurum_adi}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="org-kutu-limiti" className="block text-sm font-semibold text-surface-700 mb-1.5">
              Kutu Limiti
            </label>
            <input
              id="org-kutu-limiti"
              name="kutu_limiti"
              type="number"
              min="1"
              placeholder="50"
              value={formData.kutu_limiti}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
            <p className="mt-1.5 text-xs text-surface-400">Bu kurumun ekleyebileceği maksimum kutu sayısı.</p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Kaydediliyor...
                </span>
              ) : (
                'Kurumu Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================
// Assign Admin Modal
// ========================================
const AssignAdminModal = ({ isOpen, onClose, onSave, isSaving, organization }) => {
  const [formData, setFormData] = useState({ email: '', password: '', isim: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setError('E-posta adresi boş bırakılamaz.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (!formData.isim.trim()) {
      setError('İsim boş bırakılamaz.');
      return;
    }
    await onSave(formData);
    setFormData({ email: '', password: '', isim: '' });
  };

  // Modal kapandığında formu sıfırla
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', password: '', isim: '' });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'scaleIn 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-surface-100 bg-gradient-to-r from-indigo-50 to-violet-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-surface-900">Yönetici Ata</h3>
              <p className="text-sm text-surface-500 mt-0.5">
                <span className="font-semibold text-indigo-600">{organization.kurum_adi}</span> için yönetici hesabı oluşturun.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-100 transition-colors text-surface-400 hover:text-surface-600 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Info Badge */}
        <div className="mx-6 mt-5 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
          <div className="flex items-start gap-2.5">
            <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <div className="text-xs text-indigo-700">
              <p className="font-semibold mb-0.5">Bu hesap ile giriş yapılabilecek.</p>
              <p className="text-indigo-600/80">Oluşturulan e-posta ve şifre ile kurum yöneticisi panele giriş yapabilir.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="admin-isim" className="block text-sm font-semibold text-surface-700 mb-1.5">
              İsim Soyisim <span className="text-red-500">*</span>
            </label>
            <input
              id="admin-isim"
              name="isim"
              type="text"
              placeholder="Örn: Ahmet Yılmaz"
              value={formData.isim}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="admin-email" className="block text-sm font-semibold text-surface-700 mb-1.5">
              E-posta Adresi <span className="text-red-500">*</span>
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              placeholder="ornek@dernek.org"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-semibold text-surface-700 mb-1.5">
              Şifre <span className="text-red-500">*</span>
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              placeholder="En az 6 karakter"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
            <p className="mt-1.5 text-xs text-surface-400">Kurum yöneticisi bu bilgilerle giriş yapacak.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Oluşturuluyor...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                  Hesap Oluştur
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================
// Empty State
// ========================================
const EmptyState = ({ onAdd }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
      <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-surface-800 mb-1">Henüz Kurum Yok</h3>
    <p className="text-sm text-surface-500 mb-6">Sisteme ilk kurumunuzu ekleyerek başlayın.</p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all cursor-pointer"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      İlk Kurumu Ekle
    </button>
  </div>
);

// ========================================
// Main Page
// ========================================
const OrganizationsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Yönetici Ata modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Yetki kontrolü
  useEffect(() => {
    if (!authLoading && (!user || user.rol !== 'super_admin')) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Verileri çek
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!user || user.rol !== 'super_admin') return;
      try {
        setLoading(true);
        const data = await getAllOrganizations();
        data.sort((a, b) => {
          const dateA = a.olusturma_tarihi?.toDate?.() || new Date(0);
          const dateB = b.olusturma_tarihi?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        setOrganizations(data);
      } catch (error) {
        console.error('Kurumlar yüklenirken hata:', error);
        showNotification('Kurumlar yüklenirken hata oluştu.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveOrganization = async (formData) => {
    try {
      setIsSaving(true);
      await createOrganization(formData);
      const data = await getAllOrganizations();
      data.sort((a, b) => {
        const dateA = a.olusturma_tarihi?.toDate?.() || new Date(0);
        const dateB = b.olusturma_tarihi?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      setOrganizations(data);
      setIsModalOpen(false);
      showNotification(`"${formData.kurum_adi}" başarıyla eklendi!`);
    } catch (error) {
      console.error('Kurum eklenirken hata:', error);
      showNotification('Kurum eklenirken bir hata oluştu.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAdminModal = (org) => {
    setSelectedOrg(org);
    setIsAdminModalOpen(true);
  };

  const handleCreateAdmin = async (formData) => {
    if (!selectedOrg) return;
    try {
      setIsCreatingAdmin(true);

      // 1. Firebase Auth'da yeni kullanıcı oluştur (ikincil instance ile)
      const newUid = await createAdminUser(formData.email, formData.password);

      // 2. Firestore users koleksiyonuna doküman yaz
      await createUserDocument(newUid, {
        email: formData.email,
        isim: formData.isim,
        kurum_id: selectedOrg.id,
      });

      setIsAdminModalOpen(false);
      setSelectedOrg(null);
      showNotification(`"${formData.isim}" yöneticisi başarıyla oluşturuldu!`);
    } catch (error) {
      console.error('Yönetici oluşturulurken hata:', error);

      // Firebase Auth hata mesajlarını Türkçeleştir
      let errorMessage = 'Yönetici oluşturulurken bir hata oluştu.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanılıyor.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf. En az 6 karakter olmalıdır.';
      }
      showNotification(errorMessage, 'error');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    try {
      const date = timestamp.toDate?.() || new Date(timestamp);
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      return '—';
    }
  };

  // Auth yükleniyor veya yetki yok
  if (authLoading) return null;
  if (!user || user.rol !== 'super_admin') return null;

  return (
    <div className="space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-3 ${
            notification.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
          style={{ animation: 'scaleIn 0.25s ease-out' }}
        >
          {notification.type === 'error' ? (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {notification.message}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Kurum Yönetimi</h1>
          <p className="text-sm text-surface-500 mt-1">
            Sistemdeki tüm dernekleri ve kurumları buradan yönetin.
          </p>
        </div>
        <button
          id="btn-add-organization"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yeni Kurum Ekle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-surface-100 p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{loading ? '—' : organizations.length}</p>
              <p className="text-xs text-surface-500">Toplam Kurum</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">
                {loading ? '—' : organizations.filter(o => o.durum === 'aktif').length}
              </p>
              <p className="text-xs text-surface-500">Aktif Kurum</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-surface-100 p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">
                {loading ? '—' : organizations.reduce((sum, o) => sum + (Number(o.kutu_limiti) || 0), 0)}
              </p>
              <p className="text-xs text-surface-500">Toplam Kutu Kapasitesi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-surface-100 shadow-card overflow-hidden">
        {loading ? (
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                {['Kurum Adı', 'Kurum ID', 'Eklenme Tarihi', 'Kutu Limiti', 'Durum', 'İşlemler'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        ) : organizations.length === 0 ? (
          <EmptyState onAdd={() => setIsModalOpen(true)} />
        ) : (
          <table className="w-full" id="organizations-table">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Kurum Adı</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Kurum ID</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Eklenme Tarihi</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Kutu Limiti</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {organizations.map((org, index) => (
                <tr
                  key={org.id}
                  className="hover:bg-surface-50/80 transition-colors duration-150"
                  style={{ animation: `fadeIn 0.3s ease-out ${index * 0.05}s both` }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {(org.kurum_adi || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-surface-800">{org.kurum_adi || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono bg-surface-100 text-surface-600 px-2 py-1 rounded-lg">
                      {org.id}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-600">
                    {formatDate(org.olusturma_tarihi)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-surface-700">
                      <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                      </svg>
                      {org.kutu_limiti ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={org.durum} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleOpenAdminModal(org)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 transition-all duration-200 cursor-pointer"
                      title={`${org.kurum_adi} için yönetici ata`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                      Yönetici Ata
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Organization Modal */}
      <AddOrgModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOrganization}
        isSaving={isSaving}
      />

      {/* Assign Admin Modal */}
      <AssignAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setSelectedOrg(null);
        }}
        onSave={handleCreateAdmin}
        isSaving={isCreatingAdmin}
        organization={selectedOrg}
      />
    </div>
  );
};

export default OrganizationsPage;
