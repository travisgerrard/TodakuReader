import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import GlobalStyles from './components/layout/GlobalStyles';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Stories from './pages/Stories';
import StoryGenerator from './pages/StoryGenerator';
import StoryReader from './pages/StoryReader';
import VocabularyBrowser from './pages/VocabularyBrowser';
import GrammarBrowser from './pages/GrammarBrowser';

function App() {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  // Log environment information on startup
  useEffect(() => {
    // Log environment info on startup
    console.log('[App] Starting application');
    console.log(`[App] Environment: ${process.env.NODE_ENV}`);
    console.log(`[App] API URL: ${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}`);
    console.log(`[App] Google Client ID: ${clientId ? clientId.substring(0, 10) + '...' : 'Not configured'}`);
    console.log(`[App] Current URL: ${window.location.href}`);
    
    if (!clientId) {
      console.error('[App] ERROR: Google Client ID not configured!');
    }
  }, [clientId]);
  
  if (!clientId) {
    console.error('Google Client ID is not configured!');
  }
  
  return (
    <GoogleOAuthProvider 
      clientId={clientId || ''}
      onScriptLoadError={(err) => console.error('Google script load error:', err)}
      onScriptLoadSuccess={() => console.log('Google script loaded successfully')}
    >
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <GlobalStyles />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/stories/new" element={<StoryGenerator />} />
              <Route path="/stories/:id" element={<StoryReader />} />
              <Route path="/vocabulary" element={<VocabularyBrowser />} />
              <Route path="/grammar" element={<GrammarBrowser />} />
            </Routes>
            <Footer />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
