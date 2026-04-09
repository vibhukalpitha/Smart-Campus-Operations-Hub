import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminResourcesPage from './pages/AdminResourcesPage';
import ResourceFormPage from './pages/ResourceFormPage';
import ProfilePage from './pages/ProfilePage';
import Verify2FAPage from './pages/Verify2FAPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Root - Smart redirect based on authentication */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Authentication & Dashboard Routes (PUBLIC for login, protected for others) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-2fa" element={<Verify2FAPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          
          {/* Protected User Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Module A: Facilities & Assets - Admin Only Routes */}
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources/add"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ResourceFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources/edit/:id"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ResourceFormPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard - Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
