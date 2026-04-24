import React, { useState, useEffect } from 'react';
import { Tag, Layers, Plus, Trash2, TrendingUp, ChevronRight, ArrowLeft, Eye, User, X } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

// ✅ SUB-COMPONENT: CATEGORY POST VIEW
const CategoryPostView = ({ category, onBack }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingPost, setViewingPost] = useState(null);

    useEffect(() => {
        const fetchCategoryPosts = async () => {
            try {
                const res = await api.get(`/posts/category/${category.categoryId}`);
                setPosts(res.data);
            } catch (err) {
                console.error("Failed to fetch category posts");
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryPosts();
    }, [category]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white transition group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Back to Taxonomy
            </button>
            
            <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
                <Layers className="text-blue-500" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                    Posts in <span className="text-blue-500">{category.name}</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-10 text-center text-blue-500 animate-pulse font-mono uppercase text-xs">Syncing Category Library...</div>
                ) : posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.postId} className="bg-gray-900/50 border border-gray-800 p-6 rounded-[30px] flex justify-between items-center hover:border-blue-500/30 transition">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold">{post.title}</h3>
                                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><User size={12}/> {post.fullName || 'Author'}</span>
                                    <span>• {post.status}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setViewingPost(post)}
                                className="bg-blue-600/10 p-3 rounded-full hover:bg-blue-600 transition text-blue-500 hover:text-white"
                            >
                                <Eye size={20} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center text-gray-700 italic font-bold">No posts assigned here.</div>
                )}
            </div>

            {/* ✅ POST DETAIL MODAL */}
            {viewingPost && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
                    <div className="bg-gray-950 border border-gray-800 w-full max-w-3xl rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
                        <div className="relative h-64 bg-gray-900">
                            {viewingPost.featuredImageUrl ? (
                                <img src={viewingPost.featuredImageUrl} alt="post" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-800 font-black italic uppercase">No Cover Image</div>
                            )}
                            <button onClick={() => setViewingPost(null)} className="absolute top-6 right-6 bg-black/50 p-2 rounded-full hover:text-red-500 transition">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-10 overflow-y-auto">
                            <div className="mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 bg-blue-500/10 px-3 py-1 rounded-md">{category.name}</span>
                                <h2 className="text-4xl font-black italic uppercase tracking-tighter mt-4 leading-none">{viewingPost.title}</h2>
                                <div className="flex items-center gap-3 mt-4 text-gray-500 font-bold text-sm">
                                    <User size={12}/> {viewingPost.fullName} • {new Date(viewingPost.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <hr className="border-gray-900 mb-8" />
                            <div className="text-gray-300 leading-relaxed font-serif text-lg space-y-4">
                                {viewingPost.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ✅ MAIN COMPONENT: TAXONOMY MANAGER
const TaxonomyManager = () => {
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [newCat, setNewCat] = useState({ name: '', slug: '', description: '', parentCategoryId: null });
    const [newTag, setNewTag] = useState({ name: '', slug: '' });
    const [selectedViewCategory, setSelectedViewCategory] = useState(null);

    useEffect(() => {
        fetchTaxonomy();
    }, []);

    const fetchTaxonomy = async () => {
        try {
            const [catRes, tagRes] = await Promise.all([
                api.get('/taxonomy/categories'),
                api.get('/taxonomy/tags/trending')
            ]);
            setCategories(catRes.data);
            setTags(tagRes.data);
        } catch (err) {
            toast.error("Failed to load taxonomy data.");
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/taxonomy/categories', newCat);
            toast.success("Category Created!");
            setNewCat({ name: '', slug: '', description: '', parentCategoryId: null });
            fetchTaxonomy();
        } catch (err) { toast.error("Operation failed."); }
    };

    const handleAddTag = async (e) => {
        e.preventDefault();
        try {
            await api.post('/taxonomy/tags', newTag);
            toast.success("Tag Added!");
            setNewTag({ name: '', slug: '' });
            fetchTaxonomy();
        } catch (err) { toast.error("Duplicate tag."); }
    };

    if (selectedViewCategory) {
        return <CategoryPostView category={selectedViewCategory} onBack={() => setSelectedViewCategory(null)} />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-700">
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
                    <Layers className="text-blue-500" />
                    <h2 className="text-2xl font-black italic uppercase">Category Hierarchy</h2>
                </div>
                <form onSubmit={handleAddCategory} className="bg-gray-900/50 p-6 rounded-[30px] border border-gray-800 space-y-4">
                    <input type="text" placeholder="Category Name..." className="w-full bg-black border border-gray-800 p-3 rounded-xl focus:border-blue-500 outline-none" value={newCat.name} onChange={(e) => setNewCat({...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} />
                    <select className="w-full bg-black border border-gray-800 p-3 rounded-xl text-gray-400" onChange={(e) => setNewCat({...newCat, parentCategoryId: e.target.value || null})}>
                        <option value="">Root Category</option>
                        {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                    </select>
                    <button className="w-full py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition">+ Create Category</button>
                </form>
                <div className="space-y-2">
                    {categories.filter(c => !c.parentCategoryId).map(parent => (
                        <div key={parent.categoryId} onClick={() => setSelectedViewCategory(parent)} className="bg-gray-900/20 border border-gray-800 p-4 rounded-2xl cursor-pointer hover:border-blue-500/50 transition group">
                            <div className="flex justify-between items-center font-bold">
                                <span className="flex items-center gap-2"><ChevronRight size={14} className="text-blue-500 group-hover:translate-x-1 transition"/> {parent.name}</span>
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md">{parent.postCount} Posts</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-purple-500 pl-4">
                    <TrendingUp className="text-purple-500" />
                    <h2 className="text-2xl font-black italic uppercase">Trending Tags</h2>
                </div>
                <form onSubmit={handleAddTag} className="flex gap-2">
                    <input type="text" placeholder="#newtag" className="flex-1 bg-black border border-gray-800 p-3 rounded-xl outline-none" value={newTag.name} onChange={(e) => setNewTag({name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} />
                    <button className="px-6 bg-purple-600 rounded-xl font-bold"><Plus/></button>
                </form>
                <div className="flex flex-wrap gap-3">
                    {tags.map(tag => (
                        <div key={tag.tagId} className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-full text-xs font-bold">#{tag.name}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaxonomyManager;