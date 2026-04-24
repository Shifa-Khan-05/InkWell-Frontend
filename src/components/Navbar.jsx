import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from '../api/axios';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userData, setUserData] = useState({ fullName: '', profileImageUrl: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');

  // Check login status on route change
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

 useEffect(() => {
    const fetchNavProfile = async () => {
      if (isLoggedIn && userId && userId !== "null") {
        try {
          // ✅ FIXED: Using 'api' instance with relative path
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
    <nav className="flex justify-between items-center px-6 py-4 bg-black border-b border-gray-800 sticky top-0 z-50">
      <Link to="/">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent cursor-pointer">
          InkWell
        </h1>
      </Link>

      <div className="flex items-center space-x-6">
        <Link className="text-gray-400 hover:text-white" to="/browse">
          Browse
        </Link>

        {isLoggedIn ? (
          <>
            <Link className="text-gray-400 hover:text-white" to="/dashboard">
              Dashboard
            </Link>

            {/* ✅ USER IMAGE ADDED HERE */}
            <Link to="/profile-view" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-blue-500/20 group-hover:border-blue-500 transition-all shadow-lg">
                <img 
                  src={userData.profileImageUrl || `https://ui-avatars.com/api/?name=${userData.fullName || 'User'}&background=random`} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-500 font-medium transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="text-gray-400 hover:text-white" to="/login">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90"
            >
              Join Now
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;