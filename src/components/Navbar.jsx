import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from '../api/axios';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userData, setUserData] = useState({ fullName: '', profileImageUrl: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');

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
    <nav className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-lg font-serif">iw</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          InkWell
        </h1>
      </Link>

      <div className="flex items-center space-x-6">
        <Link className="text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors" to="/browse">
          Browse
        </Link>

        {isLoggedIn ? (
          <>
            <Link className="text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors" to="/dashboard">
              Dashboard
            </Link>

            {/* ✅ AVATAR LINK TO PROFILE-VIEW */}
            <Link to="/profile-view" className="flex items-center gap-2 group ml-2">
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
              className="text-sm font-medium text-slate-600 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" to="/login">
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
      </div>
    </nav>
  );
};

export default Navbar;