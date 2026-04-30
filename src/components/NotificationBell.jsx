import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Heart, MessageSquare, RefreshCw } from 'lucide-react';
import api from '../api/axios';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const userId = localStorage.getItem('userId');

    const fetchNotifications = async () => {
        if (!userId) return;
        setIsRefreshing(true);
        try {
            const [listRes, countRes] = await Promise.all([
                api.get(`/notifications/user/${userId}`),
                api.get(`/notifications/unread-count/${userId}`)
            ]);
            
            setNotifications(listRes.data || []);
            setUnreadCount(countRes.data || 0);
        } catch (err) {
            console.error("Failed to fetch alerts", err);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Check every minute
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
                className="p-2.5 bg-accent border border-border rounded-full hover:bg-accent/80 transition-all relative group active:scale-95 shadow-sm"
            >
                <Bell size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-background shadow-sm animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    
                    <div className="absolute right-0 mt-4 w-96 bg-card border border-border rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Notifications</h3>
                                <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">
                                    {unreadCount} New Alerts
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={fetchNotifications} 
                                    title="Refresh" 
                                    className={`p-2 hover:bg-primary/10 text-primary rounded-xl transition ${isRefreshing ? 'animate-spin' : ''}`}
                                >
                                    <RefreshCw size={16} />
                                </button>
                                <button onClick={markAllRead} title="Mark all read" className="p-2 hover:bg-primary/10 text-primary rounded-xl transition">
                                    <CheckCheck size={16} />
                                </button>
                                <button onClick={clearHistory} title="Clear history" className="p-2 hover:bg-destructive/10 text-destructive rounded-xl transition">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto custom-scrollbar bg-background/50">
                            {notifications && notifications.length > 0 ? (
                                notifications.map((note) => (
                                    <div 
                                        key={note.notificationId || note.id}
                                        className={`p-4 border-b border-border flex gap-4 hover:bg-accent/50 transition cursor-pointer ${!note.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                                        onClick={() => markAsRead(note.notificationId || note.id)}
                                    >
                                        <div className={`p-2.5 rounded-xl h-fit ${!note.isRead ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            {note.type === 'LIKE' ? <Heart size={14} fill={!note.isRead ? "currentColor" : "none"} /> : <MessageSquare size={14} />}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <p className={`text-xs leading-relaxed ${!note.isRead ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                                                {note.message || "New activity on your post"}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-bold uppercase text-muted-foreground/60 tracking-tight">
                                                    {note.createdAt ? new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                </span>
                                                {!note.isRead && <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(225,29,72,0.6)]"></div>}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-16 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 opacity-40">
                                        <Bell size={24} className="text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground italic text-[10px] uppercase tracking-[0.3em] font-black">
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