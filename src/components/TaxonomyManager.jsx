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
            <button onClick={onBack} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-bold tracking-tight bg-stone-50 hover:bg-stone-100 px-4 py-2 rounded-full border border-stone-200 group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Back to Taxonomy
            </button>
            
            <div className="flex items-center gap-4 border-l-4 border-amber-600 pl-5 py-1">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Layers size={24} /></div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Posts in <span className="text-amber-600">{category.name}</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium tracking-wide">Syncing Library...</p>
                    </div>
                ) : posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.postId} className="bg-white border border-stone-200 p-6 rounded-[2rem] shadow-sm flex justify-between items-center hover:border-amber-200 transition-all group hover:shadow-md">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{post.title}</h3>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><User size={12} className="text-amber-600"/> {post.fullName || 'Author'}</span>
                                    <span>• {post.status}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setViewingPost(post)}
                                className="bg-white border border-stone-200 p-3 rounded-xl hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all shadow-sm text-slate-400 opacity-0 group-hover:opacity-100"
                            >
                                <Eye size={20} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-stone-200 bg-stone-50 rounded-[2.5rem] text-slate-400 font-medium tracking-wide">No posts assigned here.</div>
                )}
            </div>

            {/* ✅ POST DETAIL MODAL */}
            {viewingPost && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 md:p-6">
                    <div className="bg-white w-full max-w-3xl rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="relative h-64 bg-stone-50 border-b border-stone-100">
                            {viewingPost.featuredImageUrl ? (
                                <img src={viewingPost.featuredImageUrl} alt="post" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-300 font-medium tracking-widest uppercase">No Cover Image</div>
                            )}
                            <button onClick={() => setViewingPost(null)} className="absolute top-6 right-6 bg-white/90 backdrop-blur text-slate-900 p-2.5 rounded-full hover:bg-rose-50 hover:text-rose-600 shadow-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 md:p-12 overflow-y-auto">
                            <div className="mb-8">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-md">{category.name}</span>
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mt-6 leading-tight">{viewingPost.title}</h2>
                                <div className="flex items-center gap-3 mt-6 text-slate-500 font-medium text-sm">
                                    <User size={16}/> {viewingPost.fullName} • {new Date(viewingPost.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <hr className="border-stone-100 mb-8" />
                            <div className="text-slate-700 leading-relaxed font-serif text-lg md:text-xl space-y-6">
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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in fade-in duration-700">
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-l-4 border-amber-600 pl-5 py-1">
                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Layers size={24} /></div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Category Hierarchy</h2>
                </div>
                <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm space-y-4">
                    <input type="text" placeholder="Category Name..." className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none text-slate-900 font-bold placeholder:text-stone-400 transition-all" value={newCat.name} onChange={(e) => setNewCat({...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} />
                    <select className="w-full bg-stone-50 border border-stone-200 p-4 rounded-xl text-slate-600 font-medium outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all appearance-none" onChange={(e) => setNewCat({...newCat, parentCategoryId: e.target.value || null})}>
                        <option value="">Root Category (None)</option>
                        {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                    </select>
                    <button className="w-full py-4 bg-slate-900 rounded-xl font-bold text-white hover:bg-slate-800 transition-all shadow-md hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"><Plus size={18}/> Create Category</button>
                </form>
                <div className="space-y-3">
                    {categories.filter(c => !c.parentCategoryId).map(parent => (
                        <div key={parent.categoryId} onClick={() => setSelectedViewCategory(parent)} className="bg-white border border-stone-200 p-5 rounded-2xl cursor-pointer hover:border-amber-200 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-center font-bold text-slate-800">
                                <span className="flex items-center gap-3"><ChevronRight size={18} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all"/> {parent.name}</span>
                                <span className="text-[10px] bg-stone-50 border border-stone-200 text-slate-500 px-3 py-1.5 rounded-full tracking-widest uppercase">{parent.postCount} Posts</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 border-l-4 border-emerald-500 pl-5 py-1">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><TrendingUp size={24} /></div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Trending Tags</h2>
                </div>
                <form onSubmit={handleAddTag} className="flex gap-3">
                    <input type="text" placeholder="#newtag" className="flex-1 bg-white border border-stone-200 p-4 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-900 font-bold placeholder:text-stone-400 shadow-sm" value={newTag.name} onChange={(e) => setNewTag({name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} />
                    <button className="px-6 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-700 transition-all shadow-md hover:-translate-y-0.5 active:scale-95"><Plus size={20}/></button>
                </form>
                <div className="flex flex-wrap gap-3 p-6 bg-white border border-stone-200 rounded-[2rem] shadow-sm">
                    {tags.length > 0 ? tags.map(tag => (
                        <div key={tag.tagId} className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold shadow-sm cursor-default hover:bg-emerald-100 transition-colors">#{tag.name}</div>
                    )) : <div className="text-slate-400 italic text-sm py-4 w-full text-center">No trending tags.</div>}
                </div>
            </div>
        </div>
    );
};

export default TaxonomyManager;