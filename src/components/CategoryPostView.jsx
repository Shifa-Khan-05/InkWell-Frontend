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
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium tracking-wide">Syncing Category Library...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 transition-colors duration-300">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all font-bold tracking-tight bg-muted hover:bg-muted/80 px-4 py-2 rounded-full border border-border group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Taxonomy
            </button>
            
            <div className="flex items-center gap-4 border-l-4 border-primary pl-5 py-1">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <FileText size={24} />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    Posts in <span className="text-primary">{category.name}</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {posts.length > 0 ? posts.map(post => (
                    <div key={post.postId} className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex justify-between items-center hover:border-primary/30 transition-all group hover:shadow-md">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-foreground tracking-tight">{post.title}</h3>
                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><User size={12} className="text-primary"/> {post.fullName}</span>
                                <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
                                <span className={`px-2.5 py-1 rounded-md ${post.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>{post.status}</span>
                            </div>
                        </div>
                        <button className="bg-card border border-border p-3 rounded-xl hover:text-primary hover:border-primary/30 hover:bg-primary/10 transition-all shadow-sm text-muted-foreground opacity-0 group-hover:opacity-100">
                            <Eye size={20} />
                        </button>
                    </div>
                )) : (
                    <div className="py-20 text-center border-2 border-dashed border-border bg-muted/30 rounded-[2.5rem] text-muted-foreground font-medium tracking-wide">
                        No posts assigned to this category yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryPostView;