import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from './hooks/ThemeContext';

import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

const AppContent = () => {
  const location = useLocation();
  const { theme } = useTheme();
  
  // Ensure Navbar is hidden on dashboard and success pages
  const hideNavbar = location.pathname.startsWith('/dashboard') || location.pathname === '/oauth-success';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {!hideNavbar && <Navbar />} 
      
      <main className="flex-grow">
        <AppRoutes />
      </main>

      <ToastContainer position="top-right" autoClose={3000} theme={theme} />
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