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

    const handleSubmit = async (e, statusType) => {
        e.preventDefault();
        let finalImageUrl = previewUrl; 

        try {
            // 1️⃣ Handle Media Upload first if a NEW file was picked
            if (selectedFile) {
                const mediaFormData = new FormData();
                mediaFormData.append('file', selectedFile);
                mediaFormData.append('uploaderId', loggedInUserId);
                mediaFormData.append('altText', postData.title);

                const mediaRes = await api.post('/media/upload', mediaFormData);
                finalImageUrl = mediaRes.data.url; 
            }

            // 2️⃣ Prepare Data
            const postPayload = {
                ...postData,
                status: statusType,
                featuredImageUrl: finalImageUrl,
                excerpt: postData.excerpt || postData.content.substring(0, 150) + "..."
            };

            // 3️⃣ ROUTE TO CORRECT API: Choose PUT (Update) or POST (Create)
            if (isEditing && currentPostId) {
                // ✅ Update flow
                await api.put(`/posts/${currentPostId}`, postPayload);
                toast.success("Manuscript Refined! ✨");
            } else {
                // ✅ Create flow
                await api.post('/posts/create', postPayload);
                toast.success("New Story Released! 📝");
            }

            setShowModal(false);
            fetchPosts(); 
        } catch (err) {
            console.error("Submission error:", err);
            toast.error("Operation failed. check console.");
        }
    };

    if (loading) return <div className="p-10 text-center text-blue-500 animate-pulse font-mono h-screen flex items-center justify-center bg-black text-xs uppercase tracking-widest tracking-tighter">Syncing Studio...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center border-b border-gray-800 pb-6">
                <h1 className="text-3xl font-black italic flex items-center gap-3 tracking-tighter uppercase text-white">
                    <LayoutDashboard className="text-blue-500" /> Author Studio
                </h1>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 px-8 py-3 rounded-2xl font-black uppercase italic tracking-tighter text-xs hover:bg-blue-700 transition shadow-xl shadow-blue-600/20">
                    + New Narrative
                </button>
            </div>

            <div className="bg-gray-900/30 rounded-[32px] border border-gray-800 overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/50 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="px-6 py-5">Manuscript</th>
                            <th className="px-6 py-5 text-center">Status</th>
                            <th className="px-6 py-5 text-right pr-12">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {posts.map((post) => (
                            <tr key={post.postId} className="hover:bg-gray-800/40 transition group">
                                <td className="px-6 py-6 flex items-center gap-4">
                                    <div className="h-12 w-16 rounded-xl bg-gray-800 overflow-hidden border border-gray-700 flex-shrink-0">
                                        {post.featuredImageUrl ? <img src={post.featuredImageUrl} className="w-full h-full object-cover" alt=""/> : <ImageIcon size={14} className="m-auto mt-4 text-gray-700"/>}
                                    </div>
                                    <span className="font-bold text-white text-lg tracking-tight truncate max-w-xs">{post.title}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[9px] px-3 py-1 rounded-full font-black tracking-widest border ${post.status === 'PUBLISHED' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'}`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right pr-12">
                                    <div className="flex justify-end gap-6">
                                        <button onClick={() => handleOpenModal(post)} className="text-gray-500 hover:text-blue-500 transition"><FileEdit size={18} /></button>
                                        <button onClick={() => handleDelete(post.postId)} className="text-gray-500 hover:text-red-500 transition"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
                    <div className="bg-gray-950 border border-gray-800 w-full max-w-4xl rounded-[40px] p-10 shadow-2xl overflow-y-auto max-h-[92vh] space-y-8 custom-scrollbar">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{isEditing ? 'Refine Manuscript' : 'New Narrative'}</h2>
                            <button onClick={() => setShowModal(false)} className="bg-gray-900 p-2 rounded-full hover:text-red-500 transition border border-gray-800"><X size={20} /></button>
                        </div>

                        <form className="space-y-6">
                            <div onClick={() => fileInputRef.current.click()} className="w-full h-56 bg-black border-2 border-dashed border-gray-800 rounded-[30px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition group overflow-hidden">
                                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" /> : <><UploadCloud size={30} className="text-gray-700 group-hover:text-blue-500 mb-2" /><p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Set Featured Image</p></>}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            <input type="text" value={postData.title} placeholder="Headline..." className="w-full bg-black border border-gray-800 rounded-2xl p-5 text-white outline-none focus:border-blue-600 font-bold text-xl" onChange={(e) => setPostData({...postData, title: e.target.value})} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-600 flex items-center gap-2"><Layers size={14}/> Classification</label>
                                    <select value={postData.categoryId} onChange={(e) => setPostData({...postData, categoryId: e.target.value})} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm text-gray-300 outline-none focus:border-blue-500 appearance-none">
                                        <option value="">Uncategorized</option>
                                        {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-600 flex items-center gap-2"><TagIcon size={14}/> Narrative Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <button key={tag.tagId} type="button" onClick={() => toggleTag(tag.tagId)} className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all ${postData.tagIds.includes(tag.tagId) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-blue-500/50'}`}>
                                                #{tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <textarea value={postData.content} placeholder="Begin your journey..." rows="8" className="w-full bg-black border border-gray-800 rounded-2xl p-6 text-gray-300 outline-none focus:border-blue-600 font-serif text-lg leading-relaxed" onChange={(e) => setPostData({...postData, content: e.target.value})} />

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={(e) => handleSubmit(e, "DRAFT")} className="flex-1 bg-gray-900 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:text-white transition flex justify-center items-center gap-2 border border-gray-800 hover:border-gray-600"><Save size={16}/> Archive as Draft</button>
                                <button type="button" onClick={(e) => handleSubmit(e, "PUBLISHED")} className="flex-1 bg-blue-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-2xl shadow-blue-600/20"><Send size={16}/> Release Manuscript</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthorView;