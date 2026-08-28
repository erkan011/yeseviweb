import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { updateUserDocument } from '../services/firestoreService';
import { logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // user objesinden alan adlarını esnek oku (isim veya name olabilir)
  const userName = user?.isim || user?.name || user?.displayName || '';
  const userEmail = user?.email || '';
  const userPhone = user?.telefon || user?.phone || '';
  const userRole = user?.rol || user?.role || '';

  const [formData, setFormData] = useState({
    isim: userName,
    email: userEmail,
    telefon: userPhone,
    rol: userRole,
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaveSuccess(false);
    try {
      await updateUserDocument(user?.uid, {
        isim: formData.isim,
        name: formData.isim,
        telefon: formData.telefon,
        phone: formData.telefon,
      });
      setUser(prev => ({ ...prev, isim: formData.isim, name: formData.isim, telefon: formData.telefon, phone: formData.telefon }));
      try {
        const saved = JSON.parse(localStorage.getItem('authUser') || '{}');
        localStorage.setItem('authUser', JSON.stringify({ ...saved, isim: formData.isim, name: formData.isim, telefon: formData.telefon, phone: formData.telefon }));
      } catch { /* ignore */ }
      setSaveSuccess(true);
    } catch (err) {
      console.error('Profil güncelleme hatası:', err);
      setError('Profil güncellenirken bir hata oluştu: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setResetSent(false);
    try {
      await sendPasswordResetEmail(auth, userEmail);
      setResetSent(true);
    } catch (err) {
      console.error('Şifre sıfırlama hatası:', err);
      setError('Şifre sıfırlama e-postası gönderilirken hata: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Çıkış hatası:', err);
      navigate('/login');
    }
  };

  const rolMap = {
    'super_admin': 'Süper Yönetici',
    'admin': 'Kurum Yöneticisi',
    'saha_gorevlisi': 'Saha Görevlisi',
    'personel': 'Personel',
  };

  // İsim baş harfleri
  const initials = (formData.isim || userEmail || 'K')
    .split(' ')
    .map(n => n?.[0] || '')
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'K';

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out] max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-surface-900">Ayarlar & Profil</h2>
        <p className="text-sm text-surface-400 mt-0.5">Hesap bilgilerinizi görüntüleyin ve düzenleyin</p>
      </div>

      {/* Profile Summary Card */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-surface-900 truncate">{formData.isim || 'Kullanıcı'}</h3>
            <p className="text-sm text-surface-400 truncate mt-0.5">{userEmail}</p>
            <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 ring-1 ring-primary-100">
              {rolMap[userRole] || userRole || 'Kullanıcı'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <h3 className="text-base font-semibold text-surface-800 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Profil Bilgileri
        </h3>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Ad Soyad</label>
              <input
                name="isim"
                type="text"
                value={formData.isim}
                onChange={handleChange}
                placeholder="Adınız Soyadınız"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">E-posta</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm bg-surface-50 text-surface-500 cursor-not-allowed"
              />
              <p className="text-xs text-surface-400">E-posta değiştirilemez</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Telefon</label>
              <input
                name="telefon"
                type="tel"
                value={formData.telefon}
                onChange={handleChange}
                placeholder="0532 111 2233"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 text-sm bg-white text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Rol</label>
              <input
                name="rol"
                type="text"
                value={rolMap[formData.rol] || formData.rol}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm bg-surface-50 text-surface-500 cursor-not-allowed"
              />
              <p className="text-xs text-surface-400">Rol yalnızca yönetici tarafından değiştirilebilir</p>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}
        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Profil bilgileri başarıyla güncellendi.
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Kaydediliyor...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Değişiklikleri Kaydet
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <h3 className="text-base font-semibold text-surface-800 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Güvenlik
        </h3>

        <div className="space-y-4">
          {/* Password Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-surface-50 border border-surface-100 gap-4">
            <div>
              <p className="text-sm font-medium text-surface-800">Şifre Sıfırlama</p>
              <p className="text-xs text-surface-400 mt-0.5">E-posta adresinize şifre sıfırlama bağlantısı gönderilir</p>
            </div>
            <button
              onClick={handlePasswordReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-100 text-surface-700 rounded-xl text-sm font-medium hover:bg-surface-200 ring-1 ring-surface-200 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Şifre Sıfırlama E-postası Gönder
            </button>
          </div>
          {resetSent && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Şifre sıfırlama e-postası <strong>{userEmail}</strong> adresine gönderildi.
            </div>
          )}

          {/* Logout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-surface-50 border border-surface-100 gap-4">
            <div>
              <p className="text-sm font-medium text-surface-800">Oturumu Kapat</p>
              <p className="text-xs text-surface-400 mt-0.5">Hesabınızdan güvenli bir şekilde çıkış yapın</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6">
        <h3 className="text-base font-semibold text-surface-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          Hesap Bilgileri
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
            <p className="text-xs text-surface-400">Kullanıcı ID</p>
            <p className="text-sm font-mono text-surface-700 mt-0.5 truncate">{user?.uid || '—'}</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
            <p className="text-xs text-surface-400">Kurum ID</p>
            <p className="text-sm font-mono text-surface-700 mt-0.5 truncate">{user?.kurum_id || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
