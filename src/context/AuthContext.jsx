import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthState, logout } from '../services/authService';
import { resolveUserProfile } from '../services/firestoreService';
import AuthLoadingScreen from '../components/auth/AuthLoadingScreen';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('authUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // If we don't have user in state yet, we might be reloading.
          // Keep loading true while fetching user profile to prevent redirect loops.
          if (!user) setLoading(true);

          const profile = await resolveUserProfile(firebaseUser);
          setUser(profile);
          
          try {
            const saved = JSON.parse(localStorage.getItem('authUser') || '{}');
            localStorage.setItem('authUser', JSON.stringify({ ...saved, ...profile }));
          } catch (e) {
            localStorage.setItem('authUser', JSON.stringify(profile));
          }
        } catch (error) {
          console.error("Kullanıcı verisi çekilirken hata:", error);
          await logout();
          setUser(null);
          localStorage.removeItem('authUser');
        }
      } else {
        setUser(null);
        localStorage.removeItem('authUser');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <AuthLoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
