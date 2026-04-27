import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  LayoutDashboard, FileText, LogOut, Menu, X, 
  Settings, MessageSquare, ShieldAlert, Globe, 
  Layers, Mail, Image as ImageIcon, Home
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

// Component Imports
import TaxonomyManager from '../components/TaxonomyManager';
import AuthorView from "./AuthorView"; 
import AdminView from "./AdminView";
import ReaderView from "./ReaderView";
import ModerationQueue from "../components/ModerationQueue";
import GlobalPostManager from "../components/GlobalPostManager";
import MediaLibrary from "../components/MediaLibrary"; 
import NewsletterManager from "./NewsletterManager"; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState({ fullName: '', profileImageUrl: '' });
  const [loading, setLoading] = useState(true);

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
    } else {
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserProfile = async (id) => {
    try {
      const response = await api.get(`/auth/profile/${id}`);
      if (response.data) setUserData(response.data);
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
      case 'overview': return <ReaderView />;
      case 'content': return <AuthorView />;
      case 'discussions': return <ModerationQueue />;
      case 'media': return <MediaLibrary isAdminMode={false} />; 
      case 'global-media': return <MediaLibrary isAdminMode={true} />; 
      case 'admin': return <AdminView />;
      case 'global-content': return <GlobalPostManager />;
      case 'taxonomy': return <TaxonomyManager />;
      case 'newsletter': return <NewsletterManager />;
      default: return <ReaderView />;
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
        <div className="text-slate-500 font-medium text-sm tracking-wide">Loading workspace...</div>
    </div>
  );

  return (
    <div className="bg-stone-50 text-slate-900 min-h-screen flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      <div className="flex flex-1 relative">
        {sidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

        <aside className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-white border-r border-stone-200 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-xl md:shadow-none`}>
          <div 
            onClick={() => navigate('/browse')} 
            className="p-6 h-[73px] border-b border-stone-200 flex justify-between items-center cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg font-serif">iw</span>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">InkWell</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            <button onClick={() => navigate('/browse')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium hover:text-slate-900 hover:bg-stone-50 transition-all">
              <Home size={20} /> Back to Library
            </button>

            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'overview' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50' : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'}`}>
              <LayoutDashboard size={20} /> Dashboard Home
            </button>

            {/* Standard User Actions */}
            {(role === 'AUTHOR' || role === 'ADMIN' || role === 'PREMIUM') && (
              <>
                <button onClick={() => setActiveTab('content')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'content' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50' : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'}`}>
                  <FileText size={20} /> My Content
                </button>
                <button onClick={() => setActiveTab('media')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'media' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50' : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'}`}>
                  <ImageIcon size={20} /> Media Vault
                </button>
              </>
            )}

            {/* ✅ SYSTEM ADMIN SECTION */}
            {role === 'ADMIN' && (
              <div className="pt-4 mt-4 border-t border-stone-100 space-y-1.5">
                <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">System Admin</p>
                
                <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'admin' ? 'bg-red-50 text-red-600 shadow-sm border border-red-100/50' : 'text-slate-600 hover:text-red-600 hover:bg-red-50/50'}`}>
                  <ShieldAlert size={20} /> Identity Control
                </button>

                <button onClick={() => setActiveTab('discussions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'discussions' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50' : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'}`}>
                  <MessageSquare size={20} /> Discussions
                </button>

                <button onClick={() => setActiveTab('global-content')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'global-content' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50' : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'}`}>
                  <Globe size={20} /> Global Library
                </button>

                <button onClick={() => setActiveTab('global-media')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'global-media' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'}`}>
                  <ImageIcon size={20} /> Global Assets
                </button>

                <button onClick={() => setActiveTab('taxonomy')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'taxonomy' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'}`}>
                  <Layers size={20} /> Taxonomy Center
                </button>

                <button onClick={() => setActiveTab('newsletter')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'newsletter' ? 'bg-orange-50 text-orange-700 shadow-sm border border-orange-100/50' : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'}`}>
                  <Mail size={20} /> Newsletter
                </button>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-stone-200 mt-auto bg-stone-50/50">
             <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 font-medium hover:text-slate-900 hover:bg-white hover:shadow-sm mb-2 transition-all">
                <Settings size={20} /> Profile Settings
             </Link>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all text-slate-600 hover:text-red-600 font-medium">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* ✅ UPDATED HEADER IN Dashboard.jsx */}
          <header className="flex justify-between items-center px-8 py-4 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-stone-100 rounded-lg transition-colors" onClick={() => setSidebarOpen(true)}>
                <Menu />
              </button>
              <h1 className="text-2xl font-bold tracking-tight capitalize text-slate-900">
                {activeTab.replace('-', ' ')}
              </h1>
            </div>

            <div className="flex items-center gap-6">
              {/* ✨ NEW: Notification Bell Component */}
              <div className="text-slate-500 hover:text-amber-600 transition-colors">
                <NotificationBell />
              </div>

              {/* Existing User Profile Badge */}
              <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 py-1.5 pl-1.5 pr-4 rounded-full shadow-sm hover:shadow hover:border-stone-300 transition-all cursor-pointer">
                <div className="h-8 w-8 rounded-full overflow-hidden border border-stone-200">
                  <img 
                    src={userData.profileImageUrl || `https://ui-avatars.com/api/?name=${userData.fullName || 'User'}&background=d97706&color=fff`} 
                    className="w-full h-full object-cover" 
                    alt="Avatar" 
                  />
                </div>
                <span className="text-slate-800 text-sm font-semibold truncate max-w-[150px]">
                  {userData.fullName || 'User Identity'}
                </span>
              </div>
            </div>
          </header>
          <main className="p-8 overflow-y-auto flex-1 bg-stone-50/50">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;