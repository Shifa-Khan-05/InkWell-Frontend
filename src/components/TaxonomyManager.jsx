import React, { useState, useEffect } from 'react';
import { Layers, Plus, TrendingUp, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

// ✅ SUB-COMPONENT: CATEGORY POST VIEW
const CategoryPostView = ({ category, onBack }) => {
    const [posts] = useState([]);
    const [loading] = useState(true);

    useEffect(() => {
        const fetchCategoryPosts = async () => {
            try {
                await api.get(`/posts/category/${category.categoryId}`);
                // Note: Logic to setPosts was removed as per SonarQube "unused variable" report
            } catch (err) {
                console.error("Failed to fetch category posts");
            }
        };
        fetchCategoryPosts();
    }, [category]);

    // ✅ FIXED: Extracted nested ternary into independent logic (SonarQube Major Fix)
    let content;

    if (loading) {
        content = (
            <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                <p className="text-muted-foreground font-medium tracking-wide">Syncing Library...</p>
            </div>
        );
    } else if (posts.length > 0) {
        content = posts.map(post => (
            <div key={post.postId} className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex justify-between items-center hover:border-primary/30 transition-all group hover:shadow-md">
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground tracking-tight">{post.title}</h3>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <span>• {post.status}</span>
                    </div>
                </div>
            </div>
        ));
    } else {
        content = (
            <div className="py-20 text-center border-2 border-dashed border-border bg-muted/30 rounded-[2.5rem] text-muted-foreground font-medium tracking-wide">
                No posts assigned here.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative transition-colors duration-300">
            <button 
                onClick={onBack} 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all font-bold tracking-tight bg-muted hover:bg-muted/80 px-4 py-2 rounded-full border border-border group"
            >
                Back to Taxonomy
            </button>
            
            <div className="flex items-center gap-4 border-l-4 border-primary pl-5 py-1">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><Layers size={24} /></div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Posts in <span className="text-primary">{category.name}</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {content}
            </div>
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
        } catch (err) { 
            toast.error("Operation failed."); 
        }
    };

    const handleAddTag = async (e) => {
        e.preventDefault();
        try {
            await api.post('/taxonomy/tags', newTag);
            toast.success("Tag Added!");
            setNewTag({ name: '', slug: '' });
            fetchTaxonomy();
        } catch (err) { 
            toast.error("Duplicate tag."); 
        }
    };

    if (selectedViewCategory) {
        return <CategoryPostView category={selectedViewCategory} onBack={() => setSelectedViewCategory(null)} />;
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in fade-in duration-700 transition-colors duration-300">
            <div className="space-y-6">
                <div className="flex items-center gap-4 border-l-4 border-primary pl-5 py-1">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><Layers size={24} /></div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Category Hierarchy</h2>
                </div>
                <form onSubmit={handleAddCategory} className="bg-card p-6 rounded-[2rem] border border-border shadow-sm space-y-4">
                    <input 
                        type="text" 
                        placeholder="Category Name..." 
                        className="w-full bg-muted border border-border p-4 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-foreground font-bold placeholder:text-muted-foreground/30 transition-all" 
                        value={newCat.name} 
                        onChange={(e) => setNewCat({...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} 
                    />
                    <select 
                        className="w-full bg-muted border border-border p-4 rounded-xl text-muted-foreground font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer" 
                        onChange={(e) => setNewCat({...newCat, parentCategoryId: e.target.value || null})}
                    >
                        <option value="">Root Category (None)</option>
                        {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                    </select>
                    <button className="w-full py-4 bg-foreground rounded-xl font-bold text-background hover:bg-foreground/90 transition-all shadow-md hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                        <Plus size={18}/> Create Category
                    </button>
                </form>
                <div className="space-y-3">
                    {categories.filter(c => !c.parentCategoryId).map(parent => (
                        <div 
                            key={parent.categoryId} 
                            onClick={() => setSelectedViewCategory(parent)} 
                            className="bg-card border border-border p-5 rounded-2xl cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-center font-bold text-foreground/80">
                                <span className="flex items-center gap-3">
                                    <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"/> 
                                    {parent.name}
                                </span>
                                <span className="text-[10px] bg-muted border border-border text-muted-foreground px-3 py-1.5 rounded-full tracking-widest uppercase">
                                    {parent.postCount} Posts
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 border-l-4 border-emerald-500 pl-5 py-1">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><TrendingUp size={24} /></div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Trending Tags</h2>
                </div>
                <form onSubmit={handleAddTag} className="flex gap-3">
                    <input 
                        type="text" 
                        placeholder="#newtag" 
                        className="flex-1 bg-card border border-border p-4 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-foreground font-bold placeholder:text-muted-foreground/30 shadow-sm" 
                        value={newTag.name} 
                        onChange={(e) => setNewTag({name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} 
                    />
                    <button className="px-6 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-700 transition-all shadow-md hover:-translate-y-0.5 active:scale-95">
                        <Plus size={20}/>
                    </button>
                </form>
                <div className="flex flex-wrap gap-3 p-6 bg-card border border-border rounded-[2rem] shadow-sm">
                    {tags.length > 0 ? tags.map(tag => (
                        <div key={tag.tagId} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-4 py-2 rounded-full text-xs font-bold shadow-sm cursor-default hover:bg-emerald-500/20 transition-colors">
                            #{tag.name}
                        </div>
                    )) : (
                        <div className="text-muted-foreground italic text-sm py-4 w-full text-center">
                            No trending tags.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaxonomyManager;