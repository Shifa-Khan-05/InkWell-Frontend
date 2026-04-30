import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, BookOpen, Heart, PenLine, Compass, Crown, Loader2, LayoutGrid } from 'lucide-react';
import api from '../api/axios';
import SubscriptionBox from '../components/SubscriptionBox';
import { toast } from 'react-toastify';
import usePageTitle from '../hooks/usePageTitle';

const ReaderView = ({ onWriteClick }) => {
    usePageTitle('Overview');
    const navigate = useNavigate();
    const [stats, setStats] = useState({ posts: 0, likes: 0 });
    const [isProcessing, setIsProcessing] = useState(false);
    
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role')?.replace('ROLE_', '').toUpperCase();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!userId) return;
            try {
                const res = await api.get(`/posts/author/${userId}`);
                const postList = res.data || [];
                const totalLikes = postList.reduce((acc, post) => acc + (post.likesCount || 0), 0);
                setStats({ posts: postList.length, likes: totalLikes });
            } catch (err) {
                console.warn("Stats unavailable.");
            }
        };
        const fetchFullProfile = async () => {
            if (!userId) return;
            try {
                const res = await api.get(`/auth/profile/${userId}`);
                setProfile(res.data);
            } catch (err) {
                console.error("Profile sync failed");
            }
        };
        fetchStats();
        fetchFullProfile();
    }, [userId]);

    const handleUpgrade = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const orderRes = await api.post('/payments/create-order', { amount: 499 });
            const orderData = orderRes.data;
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                amount: orderData.amount,
                currency: orderData.currency,
                name: "InkWell Premium",
                description: "Unlock Premium Manuscripts",
                order_id: orderData.id,
                prefill: { name: localStorage.getItem('username') || "User", email: "member@inkwell.com" },
                handler: async (response) => {
                    await api.post('/payments/verify', { ...response, userId });
                    toast.success("Welcome to PRO! ✨");
                    localStorage.setItem('role', 'ROLE_PREMIUM');
                    setTimeout(() => window.location.reload(), 1500);
                },
                modal: { ondismiss: () => setIsProcessing(false) },
                theme: { color: "#f59e0b" }
            };
            new window.Razorpay(options).open();
        } catch (err) {
            toast.error("Gateway error.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 transition-colors duration-300">
            {/* Identity & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => navigate('/profile')} className="p-8 bg-card border border-border rounded-3xl cursor-pointer hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
                    {role === 'PREMIUM' && (
                        <div className="absolute top-6 right-6 flex items-center gap-1 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full animate-pulse">
                            <Crown size={14} className="text-primary" />
                            <span className="text-xs font-bold text-primary tracking-wide">PRO</span>
                        </div>
                    )}
                    <div className={`p-4 rounded-2xl w-fit mb-6 transition-colors ${role === 'PREMIUM' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                        <UserCircle size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight leading-none mb-2">Identity</h3>
                    <p className="text-muted-foreground font-medium">{role === 'PREMIUM' ? 'Premium Profile' : 'Manage Bio'}</p>
                </div>
                
                {(role === 'AUTHOR' || role === 'ADMIN' || role === 'PREMIUM') && (
                    <div className="p-8 bg-card border border-border rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                        <div className="bg-blue-500/10 p-4 rounded-2xl w-fit text-blue-500 mb-6 group-hover:scale-105 transition-transform"><BookOpen size={28} /></div>
                        <h3 className="text-5xl font-bold text-foreground tracking-tight leading-none mb-2">{stats.posts}</h3>
                        <p className="text-muted-foreground font-medium">Manuscripts</p>
                    </div>
                )}

                <div className="p-8 bg-card border border-border rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-primary/10 p-4 rounded-2xl w-fit text-primary mb-6 group-hover:scale-105 transition-transform"><Heart size={28} /></div>
                    <h3 className="text-5xl font-bold text-foreground tracking-tight leading-none mb-2">{stats.likes}</h3>
                    <p className="text-muted-foreground font-medium">Appreciation</p>
                </div>
            </div>

            {/* Premium Status & Subscription Details */}
            {role === 'PREMIUM' && profile?.subscriptionEndDate && (
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden group">
                    <Crown className="absolute -right-8 -bottom-8 size-64 text-amber-500/5 rotate-12" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <h2 className="text-3xl font-bold text-foreground tracking-tight">Pro Membership</h2>
                                <span className="bg-emerald-500/20 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">Active</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-12">
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Inscribed Since</p>
                                    <p className="text-lg font-bold text-foreground">
                                        {new Date(profile.subscriptionStartDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Next Billing Cycle</p>
                                    <p className="text-lg font-bold text-amber-600">
                                        {new Date(profile.subscriptionEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleUpgrade} 
                            disabled={isProcessing}
                            className="px-8 py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 hover:shadow-lg transition-all flex items-center gap-3 disabled:opacity-70 hover:-translate-y-0.5 active:scale-95 shadow-md shadow-amber-600/20"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><LayoutGrid size={18}/> Manage Subscription</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Premium Upgrade Banner for non-pro */}
            {role === 'READER' && (
                <div className="bg-gradient-to-br from-secondary/10 to-primary/10 border border-primary/20 rounded-[2.5rem] p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm relative overflow-hidden group">
                    <Crown className="absolute -right-8 -bottom-8 size-64 text-primary/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                    <div className="space-y-3 relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Unlock Premium</h2>
                        <p className="text-muted-foreground max-w-md text-lg leading-relaxed">Access restricted manuscripts and a gold identity badge.</p>
                    </div>
                    <button onClick={handleUpgrade} disabled={isProcessing} className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 hover:shadow-lg transition-all flex items-center gap-3 disabled:opacity-70 hover:-translate-y-0.5 active:scale-95 relative z-10 w-full md:w-auto justify-center">
                        {isProcessing ? <Loader2 className="animate-spin" /> : <><Crown size={20}/> Upgrade for ₹499</>}
                    </button>
                </div>
            )}

            {/* ✅ NAVIGATION ACTION: Go back to feed */}
            <div className={`grid grid-cols-1 ${role === 'READER' ? 'lg:grid-cols-2' : ''} gap-8`}>
                {role === 'READER' && <SubscriptionBox />}
                <div className="bg-card border border-border rounded-[2.5rem] p-12 flex flex-col justify-center items-center text-center space-y-8 shadow-sm hover:shadow-md transition-all">
                     <h2 className="text-3xl font-bold text-foreground tracking-tight">
                        {role === 'PREMIUM' ? 'Discover Stories' : 'Contribute Content'}
                     </h2>
                     <button 
                        onClick={() => role === 'PREMIUM' || role === 'READER' ? navigate('/browse') : onWriteClick()} 
                        className="bg-foreground text-background px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-foreground/90 hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                     >
                         {role === 'PREMIUM' || role === 'READER' ? <><Compass size={20}/> Explore Feed</> : <><PenLine size={20}/> Draft Story</>}
                     </button>
                </div>
            </div>
        </div>
    );
};

export default ReaderView;