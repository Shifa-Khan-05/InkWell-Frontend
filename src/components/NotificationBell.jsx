import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Heart, MessageSquare } from 'lucide-react';
import api from '../api/axios';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const userId = localStorage.getItem('userId');

    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            const [listRes, countRes] = await Promise.all([
                api.get(`/notifications/user/${userId}`),
                api.get(`/notifications/unread-count/${userId}`)
            ]);
            
            // Fix: Ensure we are setting an array even if data is null/undefined
            setNotifications(listRes.data || []);
            setUnreadCount(countRes.data || 0);
        } catch (err) {
            console.error("Failed to fetch alerts", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    const markAllRead = async () => {
        try {
            await api.put(`/notifications/user/${userId}/read-all`);
            fetchNotifications();
        } catch (err) {
            console.error("Batch update failed");
        }
    };

    const clearHistory = async () => {
        try {
            await api.delete(`/notifications/user/${userId}/clean`);
            fetchNotifications();
        } catch (err) {
            console.error("Cleanup failed");
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error("Action failed");
        }
    };

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-all relative group active:scale-95"
            >
                <Bell size={20} className="text-slate-400 group-hover:text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-slate-950 shadow-sm animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    
                    <div className="absolute right-0 mt-4 w-85 bg-slate-950 border border-slate-800 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-900 flex justify-between items-center bg-slate-900/50">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-white">Notifications</h3>
                                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mt-1">
                                    {unreadCount} New Stories
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={markAllRead} title="Mark all read" className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-xl transition">
                                    <CheckCheck size={16} />
                                </button>
                                <button onClick={clearHistory} title="Clear history" className="p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto custom-scrollbar bg-black/20">
                            {notifications && notifications.length > 0 ? (
                                notifications.map((note) => (
                                    <div 
                                        key={note.notificationId || note.id} // Fixed: Fallback to .id if .notificationId is missing
                                        className={`p-4 border-b border-slate-900 flex gap-4 hover:bg-white/5 transition cursor-pointer ${!note.isRead ? 'bg-amber-500/5 border-l-2 border-l-amber-500' : ''}`}
                                        onClick={() => markAsRead(note.notificationId || note.id)}
                                    >
                                        <div className={`p-2.5 rounded-xl h-fit ${!note.isRead ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-600'}`}>
                                            {note.type === 'LIKE' ? <Heart size={14} fill={!note.isRead ? "currentColor" : "none"} /> : <MessageSquare size={14} />}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <p className={`text-xs leading-relaxed ${!note.isRead ? 'text-slate-100 font-bold' : 'text-slate-500'}`}>
                                                {note.message || "New activity on your post"}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8px] font-black uppercase text-slate-700 tracking-tighter">
                                                    {note.createdAt ? new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                </span>
                                                {!note.isRead && <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-16 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 opacity-40">
                                        <Bell size={24} className="text-slate-400" />
                                    </div>
                                    <p className="text-slate-600 italic text-[10px] uppercase tracking-[0.3em] font-black">
                                        Quiet for now...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;