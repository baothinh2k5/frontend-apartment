import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { MapSection } from './components/MapSection';
import { PropertyGrid } from './components/PropertyGrid';
import { ChatBubble } from './components/ChatBubble';
import { Footer } from './components/Footer';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ForgotPasswordVerifyPage from './pages/ForgotPasswordVerifyPage';
import ForgotPasswordConfirmedPage from './pages/ForgotPasswordConfirmedPage';
import ForgotPasswordResetPage from './pages/ForgotPasswordResetPage';

function Home() {
  return (
    <>
      <div className="flex-grow">
        <MapSection />
        <PropertyGrid />
      </div>
      <ChatBubble />
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/register' ||
    location.pathname === '/login' ||
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/forgot-password');

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password/verify" element={<ForgotPasswordVerifyPage />} />
        <Route path="/forgot-password/confirmed" element={<ForgotPasswordConfirmedPage />} />
        <Route path="/forgot-password/reset" element={<ForgotPasswordResetPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      {!isAuthPage && <Footer />}
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
