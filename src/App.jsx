import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BoxesPage from './pages/BoxesPage';
import StaffPage from './pages/StaffPage';
import OrganizationsPage from './pages/OrganizationsPage';
import BeneficiariesPage from './pages/BeneficiariesPage';
import SettingsPage from './pages/SettingsPage';

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
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="/beneficiaries" element={<BeneficiariesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
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

