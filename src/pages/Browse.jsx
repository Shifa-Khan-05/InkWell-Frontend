import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, User, Clock, BookOpen, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Browse = () => {
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
        <div className="min-h-screen bg-stone-50 text-slate-900 selection:bg-amber-200">
            <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-stone-200 pb-12 animate-pulse">
                    <div className="space-y-4">
                        <div className="h-16 w-64 bg-stone-200 rounded-lg"></div>
                        <div className="h-4 w-96 bg-stone-200 rounded"></div>
                    </div>
                    <div className="w-full md:w-96 h-14 bg-stone-200 rounded-2xl"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="bg-white border border-stone-100 rounded-3xl overflow-hidden shadow-sm flex flex-col animate-pulse h-[450px]">
                            <div className="h-60 w-full bg-stone-100"></div>
                            <div className="p-8 flex flex-col flex-1 gap-4">
                                <div className="h-6 w-3/4 bg-stone-200 rounded"></div>
                                <div className="h-4 w-full bg-stone-100 rounded mt-2"></div>
                                <div className="h-4 w-2/3 bg-stone-100 rounded"></div>
                                <div className="mt-auto pt-6 border-t border-stone-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-stone-200"></div>
                                        <div className="h-4 w-24 bg-stone-200 rounded"></div>
                                    </div>
                                    <div className="h-5 w-5 bg-stone-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-50 text-slate-900 selection:bg-amber-200 selection:text-amber-900 font-sans">
            <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
                
                {/* Header & Search Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-stone-200 pb-12">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-none">
                            Explore <span className="text-amber-600 italic font-serif">Inspiration</span>
                        </h1>
                        <p className="text-slate-500 max-w-md text-lg font-light leading-relaxed">
                            Discover perspectives from our global community of thinkers and creators.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by title or author..."
                            className="w-full bg-white border border-stone-200 shadow-sm rounded-2xl py-4 pl-14 pr-4 text-slate-900 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-stone-400"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                        <Link to={`/post/${post.slug}`} key={post.postId} className="group h-full">
                            <article className="bg-white border border-stone-100 rounded-3xl overflow-hidden h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col group/article">
                                
                                {/* ✅ Real Media Integration */}
                                <div className="h-60 w-full overflow-hidden bg-stone-100 relative">
                                    {post.featuredImageUrl ? (
                                        <img 
                                            src={post.featuredImageUrl} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover group-hover/article:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-100">
                                            <ImageIcon size={48} strokeWidth={1.5} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                            {post.readTimeMin || '3'} min read
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex-1 space-y-3">
                                        <h2 className="text-2xl font-bold text-slate-900 leading-tight group-hover/article:text-amber-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h2>
                                        
                                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                                            {post.excerpt || "A deep dive into narrative exploration within the InkWell framework..."}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 overflow-hidden shadow-sm">
                                                {post.authorImageUrl ? (
                                                    <img src={post.authorImageUrl} alt="Author" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={18} />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-800 group-hover/article:text-amber-600 transition-colors">
                                                    {post.fullName || "InkWell Author"}
                                                </span>
                                                <span className="text-xs text-slate-500">Contributor</span>
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="text-stone-400 group-hover/article:text-amber-600 group-hover/article:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </article>
                        </Link>
                    )) : (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-6 bg-white rounded-3xl border border-stone-100 shadow-sm">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                                <BookOpen size={40} className="opacity-80" />
                            </div>
                            <div className="text-center space-y-2 max-w-sm">
                                <p className="text-slate-800 text-xl font-bold">
                                    No stories found
                                </p>
                                <p className="text-slate-500">We couldn't find any articles matching your search. Try adjusting your keywords or browse all posts.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Browse;