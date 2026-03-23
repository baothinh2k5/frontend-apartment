import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { MapSection } from './components/MapSection';
import { PropertyGrid } from './components/PropertyGrid';
import { ChatBubble } from './components/ChatBubble';
import { Footer } from './components/Footer';
import RegisterPage from './pages/RegisterPage';

function HomePage() {
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
  const isAuthPage = location.pathname === '/register' || location.pathname === '/login';

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div className="flex-grow flex items-center justify-center p-4"><h1>Login Page (Placeholder)</h1></div>} />
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
