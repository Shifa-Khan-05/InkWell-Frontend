import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/ThemeContext";
import api from '../api/axios';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userData, setUserData] = useState({ fullName: '', profileImageUrl: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const { theme, toggleTheme } = useTheme();

  // Sync login status when the route changes
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

  // Fetch profile for the avatar
  useEffect(() => {
    const fetchNavProfile = async () => {
      // Check if user is logged in and has a valid ID
      if (isLoggedIn && userId && userId !== "null" && userId !== "undefined") {
        try {
          const response = await api.get(`/auth/profile/${userId}`);
          setUserData(response.data);
        } catch (err) {
          console.error("Navbar profile load failed");
        }
      }
    };
    fetchNavProfile();
  }, [isLoggedIn, userId]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-lg font-serif">iw</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          InkWell
        </h1>
      </Link>

      <div className="flex items-center space-x-6">
        <Link className="text-sm font-medium text-muted-foreground hover:text-amber-600 transition-colors" to="/browse">
          Browse
        </Link>

        {isLoggedIn ? (
          <>
            <Link className="text-sm font-medium text-muted-foreground hover:text-amber-600 transition-colors" to="/dashboard">
              Dashboard
            </Link>

            {/* ✅ AVATAR LINK TO PROFILE */}
            <Link to="/profile" className="flex items-center gap-2 group ml-2">
              <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-amber-500 transition-all shadow-sm active:scale-95">
                <img 
                  src={userData.profileImageUrl || `https://ui-avatars.com/api/?name=${userData.fullName || 'User'}&background=d97706&color=fff`} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" to="/login">
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-amber-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-amber-700 hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Join
            </Link>
          </>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-accent hover:bg-accent/80 transition-all active:scale-90"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? (
            <Moon size={20} className="text-slate-700" />
          ) : (
            <Sun size={20} className="text-amber-400" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;