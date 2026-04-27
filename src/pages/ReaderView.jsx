import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, BookOpen, Heart, PenLine, Compass, Crown, Loader2, LayoutGrid } from 'lucide-react';
import api from '../api/axios';
import SubscriptionBox from '../components/SubscriptionBox';
import { toast } from 'react-toastify';

const ReaderView = ({ onWriteClick }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ posts: 0, likes: 0 });
    const [isProcessing, setIsProcessing] = useState(false);
    
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role')?.replace('ROLE_', '').toUpperCase();

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
        fetchStats();
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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Identity & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => navigate('/profile')} className="p-8 bg-white border border-stone-100 rounded-3xl cursor-pointer hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 shadow-sm relative overflow-hidden group">
                    {role === 'PREMIUM' && (
                        <div className="absolute top-6 right-6 flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full animate-pulse">
                            <Crown size={14} className="text-amber-600" />
                            <span className="text-xs font-bold text-amber-700 tracking-wide">PRO</span>
                        </div>
                    )}
                    <div className={`p-4 rounded-2xl w-fit mb-6 transition-colors ${role === 'PREMIUM' ? 'bg-amber-50 text-amber-600' : 'bg-stone-100 text-stone-600 group-hover:bg-amber-50 group-hover:text-amber-600'}`}>
                        <UserCircle size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-2">Identity</h3>
                    <p className="text-slate-500 font-medium">{role === 'PREMIUM' ? 'Premium Profile' : 'Manage Bio'}</p>
                </div>
                
                {(role === 'AUTHOR' || role === 'ADMIN' || role === 'PREMIUM') && (
                    <div className="p-8 bg-white border border-stone-100 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                        <div className="bg-indigo-50 p-4 rounded-2xl w-fit text-indigo-600 mb-6 group-hover:scale-105 transition-transform"><BookOpen size={28} /></div>
                        <h3 className="text-5xl font-bold text-slate-900 tracking-tight leading-none mb-2">{stats.posts}</h3>
                        <p className="text-slate-500 font-medium">Manuscripts</p>
                    </div>
                )}

                <div className="p-8 bg-white border border-stone-100 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                    <div className="bg-rose-50 p-4 rounded-2xl w-fit text-rose-600 mb-6 group-hover:scale-105 transition-transform"><Heart size={28} /></div>
                    <h3 className="text-5xl font-bold text-slate-900 tracking-tight leading-none mb-2">{stats.likes}</h3>
                    <p className="text-slate-500 font-medium">Appreciation</p>
                </div>
            </div>

            {/* Premium Upgrade Banner */}
            {role === 'READER' && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-[2.5rem] p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm relative overflow-hidden group">
                    <Crown className="absolute -right-8 -bottom-8 size-64 text-amber-200/50 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                    <div className="space-y-3 relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Unlock Premium</h2>
                        <p className="text-slate-600 max-w-md text-lg leading-relaxed">Access restricted manuscripts and a gold identity badge.</p>
                    </div>
                    <button onClick={handleUpgrade} disabled={isProcessing} className="px-8 py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 hover:shadow-lg transition-all flex items-center gap-3 disabled:opacity-70 hover:-translate-y-0.5 active:scale-95 relative z-10 w-full md:w-auto justify-center">
                        {isProcessing ? <Loader2 className="animate-spin" /> : <><Crown size={20}/> Upgrade for ₹499</>}
                    </button>
                </div>
            )}

            {/* ✅ NAVIGATION ACTION: Go back to feed */}
            <div className={`grid grid-cols-1 ${role === 'READER' ? 'lg:grid-cols-2' : ''} gap-8`}>
                {role === 'READER' && <SubscriptionBox />}
                <div className="bg-white border border-stone-100 rounded-[2.5rem] p-12 flex flex-col justify-center items-center text-center space-y-8 shadow-sm hover:shadow-md transition-all">
                     <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {role === 'PREMIUM' ? 'Discover Stories' : 'Contribute Content'}
                     </h2>
                     <button 
                        onClick={() => role === 'PREMIUM' || role === 'READER' ? navigate('/browse') : onWriteClick()} 
                        className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-slate-800 hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                     >
                         {role === 'PREMIUM' || role === 'READER' ? <><Compass size={20}/> Explore Feed</> : <><PenLine size={20}/> Draft Story</>}
                     </button>
                </div>
            </div>
        </div>
    );
};

export default ReaderView;