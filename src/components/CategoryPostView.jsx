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

    if (loading) return <div className="text-blue-500 animate-pulse p-10">Syncing Category Library...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white transition">
                <ArrowLeft size={18} /> Back to Taxonomy
            </button>
            
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
                    <FileText size={24} />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    Posts in <span className="text-blue-500">{category.name}</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {posts.length > 0 ? posts.map(post => (
                    <div key={post.postId} className="bg-gray-900/50 border border-gray-800 p-6 rounded-[30px] flex justify-between items-center hover:border-blue-500/30 transition">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold">{post.title}</h3>
                            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1"><User size={12}/> {post.fullName}</span>
                                <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
                                <span className={`uppercase font-black ${post.status === 'PUBLISHED' ? 'text-green-500' : 'text-yellow-500'}`}>{post.status}</span>
                            </div>
                        </div>
                        <button className="bg-gray-800 p-3 rounded-full hover:bg-blue-600 transition">
                            <Eye size={20} />
                        </button>
                    </div>
                )) : (
                    <div className="py-20 text-center text-gray-700 italic font-bold">
                        No posts assigned to this category yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPostView;