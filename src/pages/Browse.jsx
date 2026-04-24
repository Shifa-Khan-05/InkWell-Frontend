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
        <div className="min-h-screen flex flex-col items-center justify-center bg-black">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-500 font-mono italic animate-pulse uppercase tracking-tighter">Syncing InkWell Universe...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-600/30">
            <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
                
                {/* Header & Search Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-800 pb-12">
                    <div className="space-y-4">
                        <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                            Explore <span className="text-blue-600">Content</span>
                        </h1>
                        <p className="text-gray-500 max-w-md font-bold uppercase text-[10px] tracking-widest leading-loose">
                            Discover perspectives from our global community of thinkers and creators.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text"
                            placeholder="SEARCH BY TITLE OR AUTHOR..."
                            className="w-full bg-gray-900/30 border border-gray-800 rounded-2xl py-4 pl-14 pr-4 text-white font-bold text-xs focus:ring-2 focus:ring-blue-600 focus:bg-gray-900 outline-none transition-all placeholder:text-gray-700"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                        <Link to={`/post/${post.slug}`} key={post.postId} className="group h-full">
                            <article className="bg-gray-900/10 border border-gray-800/60 rounded-[40px] overflow-hidden h-full hover:border-blue-600/40 hover:bg-gray-900/30 transition-all duration-500 flex flex-col shadow-2xl">
                                
                                {/* ✅ Real Media Integration */}
                                <div className="h-60 w-full overflow-hidden bg-black relative">
                                    {post.featuredImageUrl ? (
                                        <img 
                                            src={post.featuredImageUrl} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 brightness-75 group-hover:brightness-100"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-900 bg-gray-900/20">
                                            <ImageIcon size={64} strokeWidth={1} />
                                        </div>
                                    )}
                                    <div className="absolute bottom-6 left-6">
                                        <span className="bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-xl">
                                            {post.readTimeMin || '3'} MIN READ
                                        </span>
                                    </div>
                                </div>

                                <div className="p-10 flex flex-col flex-1">
                                    <div className="flex-1 space-y-4">
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none group-hover:text-blue-500 transition-colors duration-300 line-clamp-2">
                                            {post.title}
                                        </h2>
                                        
                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 font-medium uppercase text-[11px] tracking-tight">
                                            {post.excerpt || "A deep dive into narrative exploration within the InkWell framework..."}
                                        </p>
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-gray-800/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <User size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                                                    {post.fullName || "InkWell Author"}
                                                </span>
                                                <span className="text-[8px] font-bold text-gray-700 uppercase">Registered Contributor</span>
                                            </div>
                                        </div>
                                        <ArrowRight size={20} className="text-gray-800 group-hover:text-blue-500 group-hover:translate-x-2 transition-all duration-300" />
                                    </div>
                                </div>
                            </article>
                        </Link>
                    )) : (
                        <div className="col-span-full py-40 flex flex-col items-center justify-center space-y-6">
                            <BookOpen size={80} strokeWidth={1} className="text-gray-900 animate-pulse" />
                            <div className="text-center space-y-2">
                                <p className="text-gray-700 italic text-2xl font-black uppercase tracking-tighter">
                                    "The story you seek is yet to be written."
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-800">No manuscripts matched your query</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Browse;