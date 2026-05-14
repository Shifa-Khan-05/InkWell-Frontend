import React, { useState, useEffect, useRef } from 'react';
import { FileEdit, Trash2, X, Send, Save, LayoutDashboard, Image as ImageIcon, UploadCloud, Layers, Tag as TagIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import api from '../api/axios';
import usePageTitle from '../hooks/usePageTitle';

const AuthorView = () => {
    usePageTitle('Author Studio');
    const fileInputRef = useRef(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPostId, setCurrentPostId] = useState(null);

    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [assets, setAssets] = useState([]);
    const [assetsLoading, setAssetsLoading] = useState(false);

    const loggedInUserId = localStorage.getItem('userId');

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [postData, setPostData] = useState({
        title: '', 
        content: '', 
        excerpt: '', 
        authorId: loggedInUserId, 
        status: 'DRAFT',
        categoryId: '', 
        tagIds: []      
    });

    useEffect(() => {
        if (loggedInUserId) {
            fetchPosts();
            fetchTaxonomy();
            fetchAssets();
        }
    }, [loggedInUserId]);

    const fetchAssets = async () => {
        setAssetsLoading(true);
        try {
            const response = await api.get(`/api/author/assets/${loggedInUserId}`);
            setAssets(response.data);
        } catch (err) {
            console.error("Failed to fetch assets");
        } finally {
            setAssetsLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await api.get(`/posts/author/${loggedInUserId}`);
            setPosts(response.data);
        } catch (err) {
            toast.error("Network Error: Could not sync manuscripts.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTaxonomy = async () => {
        try {
            const [catRes, tagRes] = await Promise.all([
                api.get('/taxonomy/categories'),
                api.get('/taxonomy/tags/trending')
            ]);
            setCategories(catRes.data);
            setTags(tagRes.data);
        } catch (err) {
            console.error("Taxonomy fetch failed");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const toggleTag = (tagId) => {
        setPostData(prev => ({
            ...prev,
            tagIds: prev.tagIds.includes(tagId)
                ? prev.tagIds.filter(id => id !== tagId)
                : [...prev.tagIds, tagId]
        }));
    };

    const handleOpenModal = (post = null) => {
        if (post) {
            setIsEditing(true);
            setCurrentPostId(post.postId);
            setPreviewUrl(post.featuredImageUrl);
            setPostData({ 
                title: post.title, 
                content: post.content, 
                excerpt: post.excerpt || "", 
                authorId: loggedInUserId, 
                status: post.status,
                categoryId: post.categoryId || '',
                tagIds: post.tagIds || []
            });
        } else {
            setIsEditing(false);
            setCurrentPostId(null); 
            setPreviewUrl(null);
            setSelectedFile(null);
            setPostData({ title: '', content: '', excerpt: '', authorId: loggedInUserId, status: 'DRAFT', categoryId: '', tagIds: [] });
        }
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Permanently delete this manuscript?")) {
            try {
                await api.delete(`/posts/${id}`);
                toast.warn("Manuscript removed.");
                fetchPosts();
            } catch (err) {
                toast.error("Delete failed.");
            }
        }
    };

    const handleSubmit = async (e, status) => {
        e.preventDefault();
        
        if (!postData.title || !postData.content) {
            toast.error("Headline and Journey content are required.");
            return;
        }

        const formData = new FormData();
        formData.append('title', postData.title);
        formData.append('content', postData.content);
        formData.append('excerpt', postData.excerpt || "");
        formData.append('authorId', loggedInUserId);
        formData.append('status', status);
        
        if (postData.categoryId) {
            formData.append('categoryId', postData.categoryId);
        }
        
        if (postData.tagIds && postData.tagIds.length > 0) {
            postData.tagIds.forEach(id => formData.append('tagIds', id));
        }

        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        try {
            if (isEditing) {
                await api.put(`/posts/update/${currentPostId}`, formData);
                toast.success("Manuscript refined successfully! ✨");
            } else {
                await api.post('/posts/create', formData);
                toast.success(status === 'PUBLISHED' ? "Manuscript published! 📜" : "Draft saved.");
            }
            
            setShowModal(false);
            fetchPosts();
            fetchAssets();
        } catch (err) {
            console.error("Submission error:", err);
            toast.error("Protocol failed: Check system connectivity.");
        }
    };

    if (loading) return <div className="p-10 text-center text-muted-foreground animate-pulse font-medium h-full flex flex-col items-center justify-center bg-transparent"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mb-4"></div>Fetching Studio...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-700 transition-colors duration-300 max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><LayoutDashboard size={24} /></div> Author Studio
                </h1>
                <button onClick={() => handleOpenModal()} className="w-full sm:w-auto bg-primary px-6 py-3 rounded-xl font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                    <FileEdit size={18} /> New Narrative
                </button>
            </div>

            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Layers size={20} className="text-primary" />
                    <h2 className="text-xl font-bold text-foreground">Current Manuscripts</h2>
                </div>
                <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-5">Manuscript</th>
                                    <th className="px-6 py-5 text-center">Status</th>
                                    <th className="px-6 py-5 text-right pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {posts.map((post) => (
                                    <tr key={post.postId} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <div className="h-14 w-20 rounded-xl bg-muted overflow-hidden border border-border flex-shrink-0 flex items-center justify-center">
                                                {post.featuredImageUrl ? <img src={post.featuredImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt=""/> : <ImageIcon size={20} className="text-muted-foreground/30"/>}
                                            </div>
                                            <span className="font-bold text-foreground text-base tracking-tight truncate max-w-[200px] md:max-w-xs">{post.title}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold tracking-wide border ${post.status === 'PUBLISHED' ? 'text-green-600 border-green-500/20 bg-green-500/10' : 'text-primary border-primary/20 bg-primary/10'}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right pr-8">
                                            <div className="flex justify-end gap-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(post)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><FileEdit size={18} /></button>
                                                <button onClick={() => handleDelete(post.postId)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="block md:hidden divide-y divide-border">
                        {posts.map((post) => (
                            <div key={post.postId} className="p-5 flex flex-col gap-4 hover:bg-muted/10 transition-colors">
                                <div className="flex gap-4">
                                    <div className="h-20 w-24 rounded-2xl bg-muted overflow-hidden border border-border flex-shrink-0 flex items-center justify-center">
                                        {post.featuredImageUrl ? <img src={post.featuredImageUrl} className="w-full h-full object-cover" alt=""/> : <ImageIcon size={24} className="text-muted-foreground/30"/>}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="font-bold text-foreground text-lg leading-tight truncate mb-2">{post.title}</h4>
                                        <span className={`inline-block text-[10px] w-fit px-2 py-1 rounded-full font-black tracking-widest border ${post.status === 'PUBLISHED' ? 'text-green-600 border-green-500/20 bg-green-500/10' : 'text-primary border-primary/20 bg-primary/10'}`}>
                                            {post.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => handleOpenModal(post)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted text-muted-foreground font-bold text-sm hover:bg-muted/80 transition-colors"><FileEdit size={16}/> Edit</button>
                                    <button onClick={() => handleDelete(post.postId)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive/20 transition-colors"><Trash2 size={16}/> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {posts.length === 0 && (
                        <div className="px-6 py-16 text-center text-muted-foreground font-medium flex flex-col items-center gap-4">
                            <Layers size={40} className="text-muted-foreground/20" />
                            <p>No manuscripts found. Click "New Narrative" to get started.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                    <UploadCloud size={20} className="text-primary" />
                    <h2 className="text-xl font-bold text-foreground">Asset Vault</h2>
                </div>
                <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    {assetsLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl border border-border"></div>)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {assets.map((asset) => (
                                <div key={asset.mediaId} className="group relative aspect-square bg-muted rounded-2xl border border-border overflow-hidden hover:border-primary transition-all shadow-sm">
                                    <img src={asset.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={asset.altText} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                        <p className="text-[10px] text-white font-bold truncate">{asset.originalName}</p>
                                    </div>
                                </div>
                            ))}
                            {assets.length === 0 && (
                                <div className="col-span-full py-12 text-center text-muted-foreground font-medium flex flex-col items-center gap-3">
                                    <ImageIcon size={32} className="text-muted-foreground/20" />
                                    <p className="text-sm">No assets discovered in your vault.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/60 backdrop-blur-md p-4 sm:p-6">
                    <div className="bg-card border border-border w-full max-w-4xl rounded-3xl p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[92vh] space-y-8 custom-scrollbar animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">{isEditing ? 'Refine Manuscript' : 'New Narrative'}</h2>
                            <button onClick={() => setShowModal(false)} className="bg-muted p-2 rounded-full hover:text-destructive hover:bg-destructive/10 transition border border-border"><X size={20} /></button>
                        </div>

                        <form className="space-y-6 sm:space-y-8">
                            <div onClick={() => fileInputRef.current.click()} className="w-full h-48 sm:h-64 bg-muted border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group overflow-hidden relative">
                                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" /> : <><UploadCloud size={32} className="text-muted-foreground/40 group-hover:text-primary mb-3 transition-colors" /><p className="text-muted-foreground font-semibold text-sm">Upload Featured Image</p></>}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            <input type="text" value={postData.title} placeholder="Headline..." className="w-full bg-card border border-border rounded-2xl p-4 sm:p-5 text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-xl sm:text-2xl transition-all placeholder:text-muted-foreground/30" onChange={(e) => setPostData({...postData, title: e.target.value})} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground/80 flex items-center gap-2"><Layers size={16} className="text-primary"/> Classification</label>
                                    <select value={postData.categoryId} onChange={(e) => setPostData({...postData, categoryId: e.target.value})} className="w-full bg-card border border-border rounded-xl p-4 text-foreground font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer">
                                        <option value="">Uncategorized</option>
                                        {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground/80 flex items-center gap-2"><TagIcon size={16} className="text-primary"/> Narrative Tags</label>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                                        {tags.map(tag => (
                                            <button key={tag.tagId} type="button" onClick={() => toggleTag(tag.tagId)} className={`px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold border transition-all ${postData.tagIds.includes(tag.tagId) ? 'bg-primary/20 border-primary/30 text-primary shadow-sm' : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:bg-muted'}`}>
                                                #{tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="border border-border rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all bg-card [&_.ql-toolbar]:bg-muted [&_.ql-toolbar]:border-b-border [&_.ql-container]:border-none [&_.ql-editor]:min-h-[16rem] [&_.ql-editor]:text-base sm:[&_.ql-editor]:text-lg [&_.ql-editor]:font-serif text-foreground">
                                <ReactQuill theme="snow" value={postData.content} onChange={(value) => setPostData({...postData, content: value})} placeholder="Begin your journey..." />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-0 bg-card py-4 border-t border-border mt-auto">
                                <button type="button" onClick={(e) => handleSubmit(e, "DRAFT")} className="flex-1 bg-muted py-4 rounded-xl font-bold text-muted-foreground hover:text-foreground transition flex justify-center items-center gap-2 border border-border hover:bg-muted/80"><Save size={18}/> Save Draft</button>
                                <button type="button" onClick={(e) => handleSubmit(e, "PUBLISHED")} className="flex-1 bg-primary py-4 rounded-xl font-bold text-primary-foreground hover:bg-primary/90 transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"><Send size={18}/> Publish Manuscript</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthorView;