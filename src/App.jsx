import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OAuthSuccess from './pages/OAuthSuccess';
import PostDetails from './pages/PostDetails';
import Profile from './components/Profile';
import TaxonomyManager from './components/TaxonomyManager';
import MediaLibrary from './components/MediaLibrary';
import NewsletterManager from './pages/NewsletterManager';

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/dashboard') || location.pathname === '/oauth-success';

  return (
    <div className="min-h-screen bg-black text-white">
      {!hideNavbar && <Navbar />} 
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/post/:slug" element={<PostDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/media-library" element={<MediaLibrary />} />
        <Route path="/taxonomy-manager" element={<TaxonomyManager />} />
        <Route path="/newsletter-manager" element={<NewsletterManager />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;