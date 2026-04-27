import React, { useState, useEffect, useRef } from 'react';
import { FileEdit, Trash2, X, Send, Save, LayoutDashboard, UserCircle, Image as ImageIcon, UploadCloud, Layers, Tag as TagIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AuthorView = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPostId, setCurrentPostId] = useState(null);

    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);

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
        }
    }, [loggedInUserId]);

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
            setCurrentPostId(null); // ✅ Ensure ID is reset for new posts
            setPreviewUrl(null);
            setSelectedFile(null);
            setPostData({ title: '', content: '', excerpt: '', authorId: loggedInUserId, status: 'DRAFT', categoryId: '', tagIds: [] });
        }
        setShowModal(true);
    };

    // ✅ FIXED: Added handleDelete which was missing/undefined in your console
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
// ✅ Consolidated Submit Handler using FormData
const handleSubmit = async (e, status) => {
    e.preventDefault();
    
    if (!postData.title || !postData.content) {
        toast.error("Headline and Journey content are required.");
        return;
    }

    // 1. Initialize FormData (Required for @RequestParam and MultipartFile in Backend)
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

    // 2. Append the physical file if selected
    if (selectedFile) {
        formData.append('image', selectedFile);
    }

    try {
        if (isEditing) {
            await api.put(`/posts/update/${currentPostId}`, formData);
            toast.success("Manuscript refined successfully! ✨");
        } else {
            // ✅ This fix resolves the 415 error from your log
            await api.post('/posts/create', formData);
            toast.success(status === 'PUBLISHED' ? "Manuscript published! 📜" : "Draft saved.");
        }
        
        setShowModal(false);
        fetchPosts(); // Refresh the table
    } catch (err) {
        console.error("Submission error:", err);
        const errorMsg = err.response?.status === 415 
            ? "Protocol Error: Backend expects multipart data." 
            : "Protocol failed: Check system connectivity.";
        toast.error(errorMsg);
    }
};
    if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse font-medium h-full flex flex-col items-center justify-center bg-transparent"><div className="w-8 h-8 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>Fetching Studio...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center border-b border-stone-200 pb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight text-slate-900">
                    <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><LayoutDashboard size={24} /></div> Author Studio
                </h1>
                <button onClick={() => handleOpenModal()} className="bg-amber-600 px-6 py-3 rounded-xl font-bold text-white hover:bg-amber-700 transition-all shadow-md shadow-amber-600/20 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2">
                    <FileEdit size={18} /> New Narrative
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 border-b border-stone-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-5">Manuscript</th>
                            <th className="px-6 py-5 text-center">Status</th>
                            <th className="px-6 py-5 text-right pr-8">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {posts.map((post) => (
                            <tr key={post.postId} className="hover:bg-stone-50/50 transition-colors group">
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <div className="h-14 w-20 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0 flex items-center justify-center">
                                        {post.featuredImageUrl ? <img src={post.featuredImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt=""/> : <ImageIcon size={20} className="text-stone-300"/>}
                                    </div>
                                    <span className="font-bold text-slate-900 text-base tracking-tight truncate max-w-xs">{post.title}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold tracking-wide border ${post.status === 'PUBLISHED' ? 'text-green-700 border-green-200 bg-green-50' : 'text-amber-700 border-amber-200 bg-amber-50'}`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right pr-8">
                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenModal(post)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><FileEdit size={18} /></button>
                                        <button onClick={() => handleDelete(post.postId)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {posts.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-medium">
                                    No manuscripts found. Click "New Narrative" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-stone-200 w-full max-w-4xl rounded-3xl p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[92vh] space-y-8 custom-scrollbar">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{isEditing ? 'Refine Manuscript' : 'New Narrative'}</h2>
                            <button onClick={() => setShowModal(false)} className="bg-stone-50 p-2 rounded-full hover:text-red-500 hover:bg-red-50 transition border border-stone-200"><X size={20} /></button>
                        </div>

                        <form className="space-y-6">
                            <div onClick={() => fileInputRef.current.click()} className="w-full h-56 bg-stone-50 border-2 border-dashed border-stone-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/30 transition-all group overflow-hidden relative">
                                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" /> : <><UploadCloud size={32} className="text-stone-400 group-hover:text-amber-500 mb-3 transition-colors" /><p className="text-slate-500 font-semibold text-sm">Upload Featured Image</p></>}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            <input type="text" value={postData.title} placeholder="Headline..." className="w-full bg-white border border-stone-200 rounded-2xl p-5 text-slate-900 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 font-bold text-2xl transition-all placeholder:text-stone-300" onChange={(e) => setPostData({...postData, title: e.target.value})} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Layers size={16} className="text-amber-500"/> Classification</label>
                                    <select value={postData.categoryId} onChange={(e) => setPostData({...postData, categoryId: e.target.value})} className="w-full bg-white border border-stone-200 rounded-xl p-4 text-slate-700 font-medium outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all appearance-none cursor-pointer">
                                        <option value="">Uncategorized</option>
                                        {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><TagIcon size={16} className="text-amber-500"/> Narrative Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <button key={tag.tagId} type="button" onClick={() => toggleTag(tag.tagId)} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${postData.tagIds.includes(tag.tagId) ? 'bg-amber-100 border-amber-200 text-amber-700 shadow-sm' : 'bg-white border-stone-200 text-slate-600 hover:border-amber-300 hover:bg-stone-50'}`}>
                                                #{tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <textarea value={postData.content} placeholder="Begin your journey..." rows="8" className="w-full bg-white border border-stone-200 rounded-2xl p-6 text-slate-700 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 font-serif text-lg leading-relaxed transition-all placeholder:text-stone-300" onChange={(e) => setPostData({...postData, content: e.target.value})} />

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button type="button" onClick={(e) => handleSubmit(e, "DRAFT")} className="flex-1 bg-white py-4 rounded-xl font-bold text-slate-600 hover:text-slate-900 transition flex justify-center items-center gap-2 border border-stone-200 hover:bg-stone-50 hover:border-stone-300"><Save size={18}/> Save Draft</button>
                                <button type="button" onClick={(e) => handleSubmit(e, "PUBLISHED")} className="flex-1 bg-amber-600 py-4 rounded-xl font-bold text-white hover:bg-amber-700 transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"><Send size={18}/> Publish Manuscript</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthorView;