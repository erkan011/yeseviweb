import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthState, logout } from '../services/authService';
import { resolveUserProfile } from '../services/firestoreService';
import AuthLoadingScreen from '../components/auth/AuthLoadingScreen';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await resolveUserProfile(firebaseUser);
          setUser(profile);
        } catch (error) {
          console.error("Kullanıcı verisi çekilirken hata:", error);
          await logout();
          setUser(null);
        }
      } else {
        setUser(null);
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
