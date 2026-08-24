import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BoxesPage from './pages/BoxesPage';
import StaffPage from './pages/StaffPage';
import SubscriptionPage from './pages/SubscriptionPage';
import OrganizationsPage from './pages/OrganizationsPage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route element={user ? <MainLayout /> : <Navigate to="/login" replace />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/boxes" element={<BoxesPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/organizations" element={<OrganizationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

