import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, User, BookOpen, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const Browse = () => {
    usePageTitle('Browse');
    const [allPosts, setAllPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                // ✅ Fetching published posts from Post-Service (Port 8081) via Gateway
                const response = await api.get('/posts/published');
                setAllPosts(response.data);
                setFilteredPosts(response.data);
            } catch (err) {
                console.error("Browse fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    // Optimized Search Logic for Titles and Author Names
    useEffect(() => {
        const results = allPosts.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.fullName && post.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredPosts(results);
    }, [searchTerm, allPosts]);

    if (loading) return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-12 animate-pulse">
                    <div className="space-y-4">
                        <div className="h-16 w-64 bg-muted rounded-lg"></div>
                        <div className="h-4 w-96 bg-muted rounded"></div>
                    </div>
                    <div className="w-full md:w-96 h-14 bg-muted rounded-2xl"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col animate-pulse h-[450px]">
                            <div className="h-60 w-full bg-muted"></div>
                            <div className="p-8 flex flex-col flex-1 gap-4">
                                <div className="h-6 w-3/4 bg-muted rounded"></div>
                                <div className="h-4 w-full bg-muted rounded mt-2"></div>
                                <div className="h-4 w-2/3 bg-muted rounded"></div>
                                <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-muted"></div>
                                        <div className="h-4 w-24 bg-muted rounded"></div>
                                    </div>
                                    <div className="h-5 w-5 bg-muted rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
                
                {/* Header & Search Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-none">
                            Explore <span className="text-primary italic font-serif">Inspiration</span>
                        </h1>
                        <p className="text-muted-foreground max-w-md text-base sm:text-lg font-medium leading-relaxed opacity-80">
                            Discover perspectives from our global community of thinkers and creators.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by title or author..."
                            className="w-full bg-card border border-border shadow-sm rounded-2xl py-4 pl-14 pr-4 text-foreground font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                        <article key={post.postId} className="bg-card border border-border rounded-3xl overflow-hidden h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col group/article">
                            
                            {/* Card Image Area (Link to Post) */}
                            <Link to={`/post/${post.slug}`} className="h-60 w-full overflow-hidden bg-muted relative block">
                                {post.featuredImageUrl ? (
                                    <img 
                                        src={post.featuredImageUrl} 
                                        alt={post.title} 
                                        className="w-full h-full object-cover group-hover/article:scale-105 transition-transform duration-700 ease-out"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                                        <ImageIcon size={48} strokeWidth={1.5} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <span className="bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                        {post.readTimeMin || '3'} min read
                                    </span>
                                </div>
                            </Link>

                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex-1 space-y-3">
                                    <Link to={`/post/${post.slug}`}>
                                        <h2 className="text-2xl font-bold text-foreground leading-tight hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </h2>
                                    </Link>
                                    
                                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                                        {post.excerpt || (post.content ? post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : "No description available.")}
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                                    {/* Author Profile Link (PRO Access restricted via ProfileView) */}
                                    <Link 
                                        to={`/profile/${post.authorId}`} 
                                        className="flex items-center gap-3 hover:opacity-80 transition-opacity group/author"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden shadow-sm ring-2 ring-transparent group-hover/author:ring-primary/20 transition-all">
                                            {post.authorImageUrl ? (
                                                <img 
                                                    src={post.authorImageUrl.includes('localhost') ? (post.authorImageUrl.includes(':8084') ? post.authorImageUrl.replace(/http:\/\/localhost:8084\//, 'https://3.108.190.193.nip.io/auth/') : post.authorImageUrl.replace(/http:\/\/localhost:[0-9]+\//, 'https://3.108.190.193.nip.io/')) : post.authorImageUrl} 
                                                    alt="Author" 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <User size={18} />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-foreground group-hover/author:text-primary transition-colors">
                                                {post.fullName || "InkWell Author"}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Profile View</span>
                                        </div>
                                    </Link>
                                    
                                    <Link to={`/post/${post.slug}`} className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                                        <ArrowRight size={20} className="text-muted-foreground group-hover/article:text-primary group-hover/article:translate-x-1 transition-all" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    )) : (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-6 bg-card rounded-3xl border border-border shadow-sm">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <BookOpen size={40} className="opacity-80" />
                            </div>
                            <div className="text-center space-y-2 max-w-sm">
                                <p className="text-foreground text-xl font-bold">
                                    No stories found
                                </p>
                                <p className="text-muted-foreground">We couldn't find any articles matching your search. Try adjusting your keywords or browse all posts.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Browse;