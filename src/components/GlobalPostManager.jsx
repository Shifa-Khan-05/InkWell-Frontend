import React, { useState, useEffect } from 'react';
import { Trash2, Globe, Eye, User } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const GlobalPostManager = () => {
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAllPosts(); }, []);

    const fetchAllPosts = async () => {
        try {
            // Admin endpoint in Post-Service
            const res = await api.get('/posts/published'); 
            setAllPosts(res.data);
        } catch (err) { toast.error("Failed to load global library."); }
        finally { setLoading(false); }
    };

    const handleAdminDelete = async (postId) => {
        if (window.confirm("ADMIN ACTION: Delete this post permanently from the platform?")) {
            try {
                await api.delete(`/posts/${postId}`);
                toast.error("Content removed by Admin.");
                setAllPosts(prev => prev.filter(p => p.postId !== postId));
            } catch (err) { toast.error("Action failed."); }
        }
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium tracking-wide">Scanning Global Database...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 border-l-4 border-amber-600 pl-5 py-1">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Globe size={24} /></div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Global Content Moderation</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {allPosts.map(post => (
                    <div key={post.postId} className="bg-white border border-stone-200 p-5 rounded-[2rem] shadow-sm flex justify-between items-center hover:border-amber-200 transition-all group hover:shadow-md">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-stone-50 overflow-hidden border border-stone-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                {post.featuredImageUrl ? <img src={post.featuredImageUrl} className="w-full h-full object-cover"/> : <Globe className="text-stone-300" size={24}/>}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg tracking-tight">{post.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                                    <span className="flex items-center gap-1.5"><User size={12} className="text-amber-600"/> {post.fullName || "Anonymous Author"}</span>
                                    <span className={`px-2.5 py-1 rounded-md ${post.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                        {post.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => window.open(`/post/${post.slug}`, '_blank')} className="p-3 bg-white border border-stone-200 text-slate-400 rounded-xl hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all shadow-sm"><Eye size={20}/></button>
                            <button onClick={() => handleAdminDelete(post.postId)} className="p-3 bg-white border border-stone-200 text-slate-400 rounded-xl hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GlobalPostManager;