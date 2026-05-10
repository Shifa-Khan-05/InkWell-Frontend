import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon, Menu, X, ChevronRight, LogOut, LayoutDashboard, Compass, User } from "lucide-react";
import { useTheme } from "../hooks/ThemeContext";
import api from '../api/axios';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userData, setUserData] = useState({ fullName: '', profileImageUrl: '' });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const { theme, toggleTheme } = useTheme();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

  // Fetch profile for the avatar
  useEffect(() => {
    const fetchNavProfile = async () => {
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
    <nav className="sticky top-0 z-[100] w-full bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
              <span className="text-primary-foreground font-black text-lg sm:text-xl font-serif italic">iw</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter">
              InkWell
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all hover:bg-muted ${location.pathname === '/browse' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`} 
              to="/browse"
            >
              Browse
            </Link>

            {isLoggedIn ? (
              <>
                <Link 
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all hover:bg-muted ${location.pathname === '/dashboard' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`} 
                  to="/dashboard"
                >
                  Dashboard
                </Link>
                
                <div className="w-[1px] h-6 bg-border mx-2" />

                <Link to="/profile" className="flex items-center gap-2 pl-2 group">
                  <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all shadow-md active:scale-95 bg-muted">
                    <img 
                      src={userData.profileImageUrl || `https://ui-avatars.com/api/?name=${userData.fullName || 'User'}&background=d97706&color=fff`} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 pl-4">
                <Link className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" to="/login">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-black hover:shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  Join Now
                </Link>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="ml-4 p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-all active:scale-90 border border-border"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon size={18} className="text-slate-700" />
              ) : (
                <Sun size={18} className="text-amber-400" />
              )}
            </button>
          </div>

          {/* Mobile Actions (Theme + Menu) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-muted transition-all active:scale-90"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-primary/10 text-primary transition-all active:scale-90"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 top-[64px] z-[99] bg-background/95 backdrop-blur-xl md:hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="p-6 flex flex-col gap-4">
          
          <Link 
            to="/browse" 
            className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Compass size={20} />
              </div>
              <span className="font-bold text-lg">Browse Manuscripts</span>
            </div>
            <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          {isLoggedIn ? (
            <>
              <Link 
                to="/dashboard" 
                className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <LayoutDashboard size={20} />
                  </div>
                  <span className="font-bold text-lg">My Workbench</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/profile" 
                className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center overflow-hidden">
                    <img 
                      src={userData.profileImageUrl || `https://ui-avatars.com/api/?name=${userData.fullName || 'User'}&background=d97706&color=fff`} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <span className="block font-bold text-lg">{userData.fullName || 'My Profile'}</span>
                    <span className="text-xs text-muted-foreground">View Account</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive font-bold text-lg transition-colors mt-auto"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-4 mt-4">
              <Link to="/login" className="flex items-center justify-center p-4 rounded-2xl bg-muted font-bold text-lg">
                Log In
              </Link>
              <Link to="/register" className="flex items-center justify-center p-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20">
                Join InkWell
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;