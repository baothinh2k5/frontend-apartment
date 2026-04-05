import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { MapSection } from './components/MapSection';
import { PropertyGrid } from './components/PropertyGrid';
import { AiChatWidgetView } from './components/AiSearch/AiChatWidgetView';
import { Footer } from './components/Footer';
import { SearchProvider } from './context/SearchContext';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy loaded routes
const AboutPage = lazy(() => import('./pages/AboutPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ForgotPasswordVerifyPage = lazy(() => import('./pages/ForgotPasswordVerifyPage'));
const ForgotPasswordConfirmedPage = lazy(() => import('./pages/ForgotPasswordConfirmedPage'));
const ForgotPasswordResetPage = lazy(() => import('./pages/ForgotPasswordResetPage'));
const WaitingApprovalPage = lazy(() => import('./pages/WaitingApprovalPage'));
const PropertyDetailsPage = lazy(() => import('./pages/PropertyDetailsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';


function Home() {
  return (
    <SearchProvider>
      <div className="flex-grow">
        <MapSection />
        <PropertyGrid />
      </div>
      {/* <AiChatWidgetView /> */}
    </SearchProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const shouldHideSiteChrome = location.pathname === '/dashboard';
  const { t } = useTranslation();

  useEffect(() => {
    // Check for session failure
    const sessionExpired = localStorage.getItem('sessionExpired');
    if (sessionExpired === 'true') {
      toast.error(t('app.sessionExpired', 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'), {
        duration: 8000,
        position: 'top-center'
      });
      localStorage.removeItem('sessionExpired');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {!shouldHideSiteChrome && <Navigation />}
      <Suspense fallback={<div className="flex-grow flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-teal-600" size={32} /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/waiting-approval" element={<WaitingApprovalPage />} />
          <Route path="/forgot-password/verify" element={<ForgotPasswordVerifyPage />} />
          <Route path="/forgot-password/confirmed" element={<ForgotPasswordConfirmedPage />} />
          <Route path="/forgot-password/reset" element={<ForgotPasswordResetPage />} />
          <Route path="/property/:id" element={<PropertyDetailsPage />} />

          {/* Protected Dashboard Route */}
          <Route element={<ProtectedRoute allowedRoles={['HOST', 'ADMIN']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* 404 Not Found - catch all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      {!shouldHideSiteChrome && <Footer />}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
