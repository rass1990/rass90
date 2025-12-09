import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';

// Customer Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import BookingsPage from './pages/BookingsPage';
import BookingCreatePage from './pages/BookingCreatePage';
import PaymentPage from './pages/PaymentPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import ProfilePage from './pages/ProfilePage';

// Provider Pages
import ProviderDashboardPage from './pages/provider/ProviderDashboardPage';
import ProviderBookingsPage from './pages/provider/ProviderBookingsPage';

// Admin Pages
import { AdminLayout } from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/providers/:id" element={<ProviderProfilePage />} />

              {/* Customer Protected Routes */}
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/booking/create/:serviceId" element={<BookingCreatePage />} />
              <Route path="/booking/payment/:bookingId" element={<PaymentPage />} />
              <Route path="/booking/success/:bookingId" element={<BookingSuccessPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Provider Protected Routes */}
              <Route path="/provider/dashboard" element={<ProviderDashboardPage />} />
              <Route path="/provider/bookings" element={<ProviderBookingsPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="services" element={<AdminServicesPage />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
