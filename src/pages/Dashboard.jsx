import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  LayoutDashboard, FileText, LogOut, Menu, X, 
  Settings, MessageSquare, ShieldAlert, Globe, 
  Layers, Mail, Image as ImageIcon, Home, Sun, Moon, Bookmark, ChevronRight
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
      if (savedRole) {
          savedRole = savedRole.replace('ROLE_', '').toUpperCase();
          setRole(savedRole);
      } else {
          setRole('READER');
      }
      fetchUserProfile(userId);
      
      const interval = setInterval(() => {
          fetchUserProfile(userId);
      }, 60000);
      
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

  const NavItem = ({ icon: Icon, label, tab, pro }) => (
    <button 
      onClick={() => {
        setActiveTab(tab);
        setSidebarOpen(false);
      }} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab === tab ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
    >
      <Icon size={20} /> 
      <span className="flex-1 text-left">{label}</span>
      {pro && <span className="text-[10px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded-md">PRO</span>}
      {activeTab === tab && <ChevronRight size={14} className="opacity-50" />}
    </button>
  );

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        <div className="text-muted-foreground font-black text-xs uppercase tracking-widest">InkWell Core Syncing...</div>
    </div>
  );

  return (
    <div className="bg-background text-foreground h-screen flex flex-col overflow-hidden transition-colors duration-300">
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/60 backdrop-blur-md z-[60] md:hidden transition-opacity" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`fixed md:static z-[70] top-0 left-0 h-full w-[280px] sm:w-72 bg-card border-r border-border transform transition-transform duration-500 ease-in-out flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-2xl md:shadow-none`}>
          <div className="p-6 flex justify-between items-center border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-black text-xl font-serif italic">iw</span>
              </div>
              <span className="text-xl font-black text-foreground tracking-tighter">InkWell</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="md:hidden p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            <NavItem icon={LayoutDashboard} label="Overview" tab="overview" />
            
            {(role === 'ADMIN' || role === 'PREMIUM') && (
              <NavItem icon={Bookmark} label="Saved Library" tab="saved" pro={true} />
            )}

            {(role === 'AUTHOR' || role === 'ADMIN' || role === 'PREMIUM') && (
              <>
                <NavItem icon={FileText} label="My Content" tab="content" />
                <NavItem icon={ImageIcon} label="Media Vault" tab="media" />
              </>
            )}

            {role === 'ADMIN' && (
              <div className="pt-6 mt-6 border-t border-border space-y-1.5">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">Management Control</p>
                <NavItem icon={ShieldAlert} label="Identity" tab="admin" />
                <NavItem icon={MessageSquare} label="Discussions" tab="discussions" />
                <NavItem icon={Globe} label="Global Library" tab="global-content" />
                <NavItem icon={ImageIcon} label="Global Assets" tab="global-media" />
                <NavItem icon={Layers} label="Taxonomy" tab="taxonomy" />
                <NavItem icon={Mail} label="Newsletter" tab="newsletter" />
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-border mt-auto bg-muted/20 backdrop-blur-sm">
             <button 
              onClick={() => { navigate('/profile'); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground font-bold text-sm hover:text-foreground hover:bg-card hover:shadow-sm mb-2 transition-all"
             >
                <Settings size={20} /> Profile Settings
             </button>
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold text-sm transition-all"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Header */}
          <header className="flex justify-between items-center h-16 sm:h-20 px-4 sm:px-8 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden p-2.5 text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors" 
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <h1 className="text-lg sm:text-xl font-black tracking-tighter capitalize text-foreground truncate max-w-[150px] sm:max-w-none">
                {activeTab.replace('-', ' ')}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleTheme}
                className="hidden sm:flex p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-all border border-border"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <NotificationBell />

              {/* User Identity Chip */}
              <Link to="/profile" className="flex items-center gap-2 sm:gap-3 bg-muted/50 border border-border py-1 sm:py-1.5 pl-1 sm:pl-1.5 pr-2 sm:pr-4 rounded-full hover:border-primary/30 transition-all shadow-sm">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border border-border ring-2 ring-background">
                  <img 
                    src={userData.profileImageUrl || `https://ui-avatars.com/api/?name=${userData.fullName || 'User'}&background=d97706&color=fff`} 
                    className="w-full h-full object-cover" 
                    alt="Avatar" 
                  />
                </div>
                <span className="hidden xs:block text-foreground text-xs sm:text-sm font-bold truncate max-w-[80px] sm:max-w-[120px]">
                  {userData.fullName?.split(' ')[0] || 'User'}
                </span>
              </Link>
            </div>
          </header>

          {/* Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-muted/10 custom-scrollbar">
            <div className="max-w-7xl mx-auto h-full">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;