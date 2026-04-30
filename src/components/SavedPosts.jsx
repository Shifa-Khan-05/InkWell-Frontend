import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Bookmark, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedPosts = () => {
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchSavedPosts = async () => {
            try {
                const res = await api.get(`/posts/saved/${userId}`);
                setSavedPosts(res.data);
            } catch (err) {
                console.error("Failed to fetch saved posts", err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchSavedPosts();
    }, [userId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground font-medium">Retrieving your library...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
                    <Bookmark size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Your Saved Library</h2>
                    <p className="text-muted-foreground">Exclusive Pro Collection of curated manuscripts.</p>
                </div>
            </div>

            {savedPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedPosts.map(post => (
                        <div key={post.postId} className="glass-card p-6 rounded-[2.5rem] flex flex-col group hover:-translate-y-1 transition-all duration-300">
                            <div className="aspect-video rounded-3xl overflow-hidden mb-6 border border-border">
                                <img 
                                    src={post.featuredImageUrl || 'https://placehold.co/600x400/f5f5f4/a8a29e/png?text=InkWell'} 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
                                    alt={post.title}
                                />
                            </div>
                            <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">{post.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">{post.excerpt}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                        {post.fullName?.charAt(0) || 'A'}
                                    </div>
                                    <span className="text-xs font-bold text-muted-foreground">{post.fullName || 'Author'}</span>
                                </div>
                                <Link 
                                    to={`/post/${post.slug}`} 
                                    className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    <ChevronRight size={18} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center glass-card rounded-[3rem] border-dashed border-2">
                    <Bookmark size={48} className="mx-auto mb-6 text-muted-foreground/20" />
                    <h3 className="text-2xl font-bold mb-2">Library is Empty</h3>
                    <p className="text-muted-foreground mb-8">Save some manuscripts to access them later offline.</p>
                    <Link to="/browse" className="btn-primary inline-flex items-center gap-2">
                        Browse Feed <ChevronRight size={18} />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SavedPosts;
