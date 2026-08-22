import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BoxesPage from './pages/BoxesPage';
import StaffPage from './pages/StaffPage';
import SubscriptionPage from './pages/SubscriptionPage';
import OrganizationsPage from './pages/OrganizationsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes (wrapped with MainLayout) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/boxes" element={<BoxesPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/organizations" element={<OrganizationsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

