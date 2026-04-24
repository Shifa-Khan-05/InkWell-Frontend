import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  LayoutDashboard, FileText, LogOut, Menu, X, 
  Settings, MessageSquare, ShieldAlert, Globe, 
  Layers, Mail, Image as ImageIcon
} from 'lucide-react';

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
    
    // ✅ Stronger check for valid session
    if (token && userId && userId !== "null" && userId !== "undefined") {
      if (savedRole) savedRole = savedRole.replace('ROLE_', '').toUpperCase();
      setRole(savedRole || 'READER');
      fetchUserProfile(userId);
    } else {
      console.warn("Invalid session state, redirecting...");
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserProfile = async (id) => {
    try {
      const response = await api.get(`/auth/profile/${id}`);
      if (response.data) {
        setUserData(response.data);
      }
    } catch (err) { 
      console.error("Dashboard profile fetch failed:", err); 
    } finally {
      // ✅ ALWAYS stop loading, even on error
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-blue-500 font-mono text-xs tracking-widest uppercase animate-pulse">
            Establishing Secure Connection...
        </div>
    </div>
  );

  return (
    <div className="bg-black text-white min-h-screen flex flex-col font-sans">
      <div className="flex flex-1 relative">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}

        <aside className={`fixed md:static z-50 top-0 left-0 h-full w-64 bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-2xl`}>
          <div className="p-6 text-2xl font-black border-b border-gray-800 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent italic flex justify-between items-center font-serif">
            InkWell
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400"><X size={24} /></button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'overview' ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
              <LayoutDashboard size={20} /> Overview
            </button>

            {(role === 'AUTHOR' || role === 'ADMIN') && (
              <>
                <button onClick={() => setActiveTab('content')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'content' ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
                  <FileText size={20} /> My Content
                </button>
                <button onClick={() => setActiveTab('media')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'media' ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
                  <ImageIcon size={20} /> Media Vault
                </button>
                <button onClick={() => setActiveTab('discussions')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'discussions' ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
                  <MessageSquare size={20} /> Discussions
                </button>
              </>
            )}

            {role === 'ADMIN' && (
              <div className="pt-4 mt-4 border-t border-gray-800 space-y-2">
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">System Admin</p>
                <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'admin' ? 'bg-red-600/10 text-red-500 font-bold' : 'text-gray-400 hover:text-red-500 hover:bg-red-900/10'}`}>
                  <ShieldAlert size={20} /> Identity Control
                </button>
                <button onClick={() => setActiveTab('global-content')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'global-content' ? 'bg-blue-600/10 text-blue-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
                  <Globe size={20} /> Global Library
                </button>
                <button onClick={() => setActiveTab('global-media')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'global-media' ? 'bg-purple-600/10 text-purple-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
                  <ImageIcon size={20} /> Global Assets
                </button>
                <button onClick={() => setActiveTab('taxonomy')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'taxonomy' ? 'bg-purple-600/10 text-purple-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
                  <Layers size={20} /> Taxonomy Center
                </button>
                <button onClick={() => setActiveTab('newsletter')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === 'newsletter' ? 'bg-orange-600/10 text-orange-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}>
                  <Mail size={20} /> Newsletter
                </button>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-gray-800 mt-auto">
             <Link to="/profile" className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 mb-2 transition">
                <Settings size={20} /> Profile Settings
             </Link>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-3 rounded-xl hover:bg-red-600/10 transition text-red-500 font-bold">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="flex justify-between items-center px-8 py-5 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 hover:bg-gray-800 rounded-lg" onClick={() => setSidebarOpen(true)}><Menu /></button>
              <h1 className="text-xl font-black italic tracking-tight uppercase text-gray-400">{activeTab.replace('-', ' ')}</h1>
            </div>

            <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 p-1.5 pr-5 rounded-full">
              <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-blue-500/20">
                <img 
                  src={userData.profileImageUrl || `https://ui-avatars.com/api/?name=${userData.fullName || 'User'}&background=0D8ABC&color=fff`} 
                  className="w-full h-full object-cover" 
                  alt="Avatar" 
                />
              </div>
              <span className="text-white text-sm font-bold truncate max-w-[150px] uppercase tracking-tighter">
                {userData.fullName || 'User Identity'}
              </span>
            </div>
          </header>

          <main className="p-8 overflow-y-auto flex-1 bg-[#050505]">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;