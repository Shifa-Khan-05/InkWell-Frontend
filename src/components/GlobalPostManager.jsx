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

    if (loading) return <div className="p-10 text-center animate-pulse text-blue-500 font-mono text-xs">SCANNING GLOBAL DATABASE...</div>;

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 border-l-4 border-blue-600 pl-4">
                <Globe className="text-blue-500" />
                <h2 className="text-2xl font-black italic uppercase">Global Content Moderation</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {allPosts.map(post => (
                    <div key={post.postId} className="bg-gray-950 border border-gray-800 p-6 rounded-[30px] flex justify-between items-center hover:border-red-500/30 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-gray-900 overflow-hidden border border-gray-800">
                                {post.featuredImageUrl ? <img src={post.featuredImageUrl} className="w-full h-full object-cover"/> : <Globe className="m-auto h-full text-gray-800"/>}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{post.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                                    <User size={12} className="text-blue-500"/> {post.fullName || "Anonymous Author"}
                                    <span className={`px-2 py-0.5 rounded-md ${post.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {post.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => window.open(`/post/${post.slug}`, '_blank')} className="p-3 bg-gray-900 text-gray-400 rounded-2xl hover:text-white transition"><Eye size={20}/></button>
                            <button onClick={() => handleAdminDelete(post.postId)} className="p-3 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GlobalPostManager;