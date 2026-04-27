import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText, User, Eye, ArrowLeft } from 'lucide-react';

const CategoryPostView = ({ category, onBack }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryPosts = async () => {
            try {
                const res = await api.get(`/posts/category/${category.categoryId}`);
                setPosts(res.data);
            } catch (err) {
                console.error("Failed to fetch posts for category");
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryPosts();
    }, [category]);

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium tracking-wide">Syncing Category Library...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-bold tracking-tight bg-stone-50 hover:bg-stone-100 px-4 py-2 rounded-full border border-stone-200 group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Taxonomy
            </button>
            
            <div className="flex items-center gap-4 border-l-4 border-amber-600 pl-5 py-1">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                    <FileText size={24} />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Posts in <span className="text-amber-600">{category.name}</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {posts.length > 0 ? posts.map(post => (
                    <div key={post.postId} className="bg-white border border-stone-200 p-6 rounded-[2rem] shadow-sm flex justify-between items-center hover:border-amber-200 transition-all group hover:shadow-md">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{post.title}</h3>
                            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><User size={12} className="text-amber-600"/> {post.fullName}</span>
                                <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
                                <span className={`px-2.5 py-1 rounded-md ${post.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{post.status}</span>
                            </div>
                        </div>
                        <button className="bg-white border border-stone-200 p-3 rounded-xl hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all shadow-sm text-slate-400 opacity-0 group-hover:opacity-100">
                            <Eye size={20} />
                        </button>
                    </div>
                )) : (
                    <div className="py-20 text-center border-2 border-dashed border-stone-200 bg-stone-50 rounded-[2.5rem] text-slate-400 font-medium tracking-wide">
                        No posts assigned to this category yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPostView;