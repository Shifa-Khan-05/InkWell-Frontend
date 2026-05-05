import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  LayoutDashboard, FileText, LogOut, Menu, X, 
  Settings, MessageSquare, ShieldAlert, Globe, 
  Layers, Mail, Image as ImageIcon, Home, Sun, Moon, Bookmark
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import { useTheme } from '../hooks/ThemeContext';
import usePageTitle from '../hooks/usePageTitle';

// Component Imports
import TaxonomyManager from '../components/TaxonomyManager';
import AuthorView from "./AuthorView"; 
import AdminView from "./AdminView";
import ReaderView from "./ReaderView";
import ModerationQueue from "../components/ModerationQueue";
import GlobalPostManager from "../components/GlobalPostManager";
import MediaLibrary from "../components/MediaLibrary"; 
import NewsletterManager from "./NewsletterManager"; 
import SavedPosts from "../components/SavedPosts";

const Dashboard = () => {
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState({ fullName: '', profileImageUrl: '' });
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    let savedRole = localStorage.getItem("role"); 
    
    if (token && userId && userId !== "null" && userId !== "undefined") {
      // ✅ Normalized role check to handle both "ADMIN" and "ROLE_ADMIN"
      if (savedRole) {
          savedRole = savedRole.replace('ROLE_', '').toUpperCase();
          setRole(savedRole);
      } else {
          setRole('READER');
      }
      fetchUserProfile(userId);
      
      // Periodically sync profile to catch role changes dynamically
      const interval = setInterval(() => {
          fetchUserProfile(userId);
      }, 60000); // Every minute
      
      return () => clearInterval(interval);
    } else {
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserProfile = async (id) => {
    try {
      const response = await api.get(`/auth/profile/${id}`);
      if (response.data) {
        setUserData(response.data);
        
        // Ensure the role is up-to-date in case it was changed by an admin
        if (response.data.role) {
          const fetchedRole = response.data.role.replace('ROLE_', '').toUpperCase();
          setRole(fetchedRole);
          localStorage.setItem('role', response.data.role);
        }
      }
    } catch (err) { 
      console.error("Dashboard profile fetch failed:", err); 
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return <ReaderView onWriteClick={() => setActiveTab('content')} />;
      case 'content': return <AuthorView />;
      case 'discussions': return <ModerationQueue />;
      case 'media': return <MediaLibrary isAdminMode={false} />; 
      case 'global-media': return <MediaLibrary isAdminMode={true} />; 
      case 'admin': return <AdminView />;
      case 'global-content': return <GlobalPostManager />;
      case 'taxonomy': return <TaxonomyManager />;
      case 'newsletter': return <NewsletterManager />;
      case 'saved': return <SavedPosts />;
      default: return <ReaderView onWriteClick={() => setActiveTab('content')} />;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4 transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        <div className="text-muted-foreground font-medium text-sm tracking-wide">Loading workspace...</div>
    </div>
  );

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-300">
      <div className="flex flex-1 relative">
        {sidebarOpen && <div className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

        <aside className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-xl md:shadow-none`}>
          <div 
            onClick={() => navigate('/browse')} 
            className="p-6 h-[73px] border-b border-border flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg font-serif">iw</span>
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">InkWell</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground"><X size={24} /></button>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            <button onClick={() => navigate('/browse')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground font-medium hover:text-foreground hover:bg-muted transition-all">
              <Home size={20} /> Back to Library
            </button>

            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'overview' ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              <LayoutDashboard size={20} /> Dashboard Home
            </button>

            {/* Saved Library - PRO FEATURE */}
            {(role === 'ADMIN' || role === 'PREMIUM') && (
                <button onClick={() => setActiveTab('saved')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'saved' ? 'bg-secondary/10 text-secondary shadow-sm border border-secondary/20' : 'text-muted-foreground hover:text-secondary hover:bg-secondary/5'}`}>
                    <Bookmark size={20} /> Saved Library
                    <span className="ml-auto text-[10px] font-bold bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-md">PRO</span>
                </button>
            )}

            {/* Standard User Actions */}
            {(role === 'AUTHOR' || role === 'ADMIN' || role === 'PREMIUM') && (
              <>
                <button onClick={() => setActiveTab('content')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'content' ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  <FileText size={20} /> My Content
                </button>
                <button onClick={() => setActiveTab('media')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'media' ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  <ImageIcon size={20} /> Media Vault
                </button>
              </>
            )}

            {/* ✅ SYSTEM ADMIN SECTION */}
            {role === 'ADMIN' && (
              <div className="pt-4 mt-4 border-t border-border space-y-1.5">
                <p className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">System Admin</p>
                
                <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'admin' ? 'bg-destructive/10 text-destructive shadow-sm border border-destructive/20' : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5'}`}>
                  <ShieldAlert size={20} /> Identity Control
                </button>

                <button onClick={() => setActiveTab('discussions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'discussions' ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  <MessageSquare size={20} /> Discussions
                </button>

                <button onClick={() => setActiveTab('global-content')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'global-content' ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  <Globe size={20} /> Global Library
                </button>

                <button onClick={() => setActiveTab('global-media')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'global-media' ? 'bg-secondary/20 text-secondary-foreground shadow-sm border border-secondary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  <ImageIcon size={20} /> Global Assets
                </button>

                <button onClick={() => setActiveTab('taxonomy')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'taxonomy' ? 'bg-secondary/20 text-secondary-foreground shadow-sm border border-secondary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  <Layers size={20} /> Taxonomy Center
                </button>

                <button onClick={() => setActiveTab('newsletter')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'newsletter' ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  <Mail size={20} /> Newsletter
                </button>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-border mt-auto bg-muted/30">
             <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground font-medium hover:text-foreground hover:bg-card hover:shadow-sm mb-2 transition-all">
                <Settings size={20} /> Profile Settings
             </Link>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive font-medium">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* ✅ UPDATED HEADER IN Dashboard.jsx */}
          <header className="flex justify-between items-center px-8 py-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" onClick={() => setSidebarOpen(true)}>
                <Menu />
              </button>
              <h1 className="text-2xl font-bold tracking-tight capitalize text-foreground">
                {activeTab.replace('-', ' ')}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-accent hover:bg-accent/80 transition-all active:scale-90"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? (
                  <Moon size={18} className="text-slate-700" />
                ) : (
                  <Sun size={18} className="text-amber-400" />
                )}
              </button>

              {/* ✨ NEW: Notification Bell Component */}
              <div className="transition-colors">
                <NotificationBell />
              </div>

              {/* Existing User Profile Badge */}
              <div className="flex items-center gap-3 bg-muted border border-border py-1.5 pl-1.5 pr-4 rounded-full shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                <div className="h-8 w-8 rounded-full overflow-hidden border border-border">
                  <img 
                    src={userData.profileImageUrl || `https://ui-avatars.com/api/?name=${userData.fullName || 'User'}&background=d97706&color=fff`} 
                    className="w-full h-full object-cover" 
                    alt="Avatar" 
                  />
                </div>
                <span className="text-foreground text-sm font-semibold truncate max-w-[120px]">
                  {userData.fullName || 'User Identity'}
                </span>
              </div>
            </div>
          </header>
          <main className="p-8 overflow-y-auto flex-1 bg-muted/20">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;