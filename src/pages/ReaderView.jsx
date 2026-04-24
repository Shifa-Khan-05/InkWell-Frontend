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
                <div onClick={() => navigate('/profile')} className="p-8 bg-gray-900/40 border border-gray-800 rounded-[40px] cursor-pointer hover:border-blue-500/50 transition group shadow-2xl relative overflow-hidden">
                    {role === 'PREMIUM' && (
                        <div className="absolute top-6 right-6 flex items-center gap-1 bg-amber-500/10 border border-amber-500/50 px-3 py-1 rounded-full animate-pulse">
                            <Crown size={12} className="text-amber-500" />
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">PRO</span>
                        </div>
                    )}
                    <div className={`p-4 rounded-2xl w-fit mb-6 transition ${role === 'PREMIUM' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-600/10 text-blue-500'}`}>
                        <UserCircle size={28} />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Identity</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{role === 'PREMIUM' ? 'Premium Profile' : 'Manage Bio'}</p>
                </div>
                
                {(role === 'AUTHOR' || role === 'ADMIN' || role === 'PREMIUM') && (
                    <div className="p-8 bg-gray-900/40 border border-gray-800 rounded-[40px] shadow-2xl group hover:border-purple-500/30 transition">
                        <div className="bg-purple-600/10 p-4 rounded-2xl w-fit text-purple-500 mb-6"><BookOpen size={28} /></div>
                        <h3 className="text-5xl font-black italic tracking-tighter text-white">{stats.posts}</h3>
                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest mt-1">Manuscripts</p>
                    </div>
                )}

                <div className="p-8 bg-gray-900/40 border border-gray-800 rounded-[40px] shadow-2xl group hover:border-red-500/30 transition">
                    <div className="bg-red-600/10 p-4 rounded-2xl w-fit text-red-500 mb-6"><Heart size={28} /></div>
                    <h3 className="text-5xl font-black italic tracking-tighter text-white">{stats.likes}</h3>
                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest mt-1">Appreciation</p>
                </div>
            </div>

            {/* Premium Upgrade Banner */}
            {role === 'READER' && (
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/20 border border-amber-500/30 rounded-[50px] p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
                    <Crown className="absolute -right-10 -bottom-10 size-64 text-amber-500/5 rotate-12 group-hover:text-amber-500/10 transition-all duration-700" />
                    <div className="space-y-2 relative z-10">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Unlock Premium</h2>
                        <p className="text-gray-400 font-medium max-w-md">Access restricted manuscripts and a gold identity badge.</p>
                    </div>
                    <button onClick={handleUpgrade} disabled={isProcessing} className="px-10 py-5 bg-amber-500 text-black font-black uppercase italic tracking-tighter rounded-2xl hover:bg-white transition-all shadow-xl flex items-center gap-3 disabled:opacity-50 relative z-10">
                        {isProcessing ? <Loader2 className="animate-spin" /> : <><Crown size={20}/> Upgrade for ₹499</>}
                    </button>
                </div>
            )}

            {/* ✅ NAVIGATION ACTION: Go back to feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {role === 'READER' && <SubscriptionBox />}
                <div className={`${role === 'PREMIUM' ? 'bg-blue-600' : 'bg-gray-900 border border-gray-800'} rounded-[45px] p-10 flex flex-col justify-center items-center text-center space-y-6 shadow-2xl group transition-all`}>
                     <h2 className={`text-3xl font-black italic uppercase ${role === 'PREMIUM' ? 'text-white' : 'text-blue-500'}`}>
                        {role === 'PREMIUM' ? 'Discover Stories' : 'Contribute Content'}
                     </h2>
                     <button 
                        onClick={() => role === 'PREMIUM' || role === 'READER' ? navigate('/browse') : onWriteClick()} 
                        className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase italic text-xs flex items-center gap-3 hover:bg-white hover:text-black transition-all shadow-xl"
                     >
                         {role === 'PREMIUM' || role === 'READER' ? <><Compass size={20}/> Explore Feed</> : <><PenLine size={20}/> Draft Story</>}
                     </button>
                </div>
            </div>
        </div>
    );
};

export default ReaderView;