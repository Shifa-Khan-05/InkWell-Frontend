import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, Link, User } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const MediaLibrary = ({ isAdminMode = false }) => {
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    
    const loggedInUserId = localStorage.getItem('userId');

    // Inside MediaLibrary.jsx
useEffect(() => {
    const userId = localStorage.getItem('userId');
    
    // ✅ ONLY fetch if userId exists and isn't the string "null"
    if (userId && userId !== "null") {
        fetchMedia();
    } else if (!isAdminMode) {
        console.error("No User ID found for Media Vault");
    }
}, [isAdminMode]);
    const fetchMedia = async () => {
        try {
            // ✅ Logic: Admin sees /all, Authors see their own
            const endpoint = isAdminMode ? '/media/all' : `/media/uploader/${loggedInUserId}`;
            const res = await api.get(endpoint);
            setMediaList(res.data);
        } catch (err) {
            toast.error("Failed to sync media library.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploaderId', loggedInUserId);
        formData.append('altText', file.name);

        try {
            await api.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Asset added to vault! 🖼️");
            fetchMedia();
        } catch (err) {
            toast.error("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        toast.info("URL copied to clipboard! 📋");
    };

    const deleteMedia = async (id) => {
        if (window.confirm("Remove this asset? This cannot be undone.")) {
            try {
                await api.delete(`/media/${id}`);
                setMediaList(prev => prev.filter(m => m.mediaId !== id));
                toast.warn("Asset deleted.");
            } catch (err) {
                toast.error("Deletion failed.");
            }
        }
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium tracking-wide">Accessing Media Vault...</p>
        </div>
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-stone-200 pb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4 text-slate-900">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><ImageIcon size={28}/></div> 
                        {isAdminMode ? 'Global Assets' : 'Media Library'}
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 text-lg">
                        {isAdminMode ? 'System-wide Repository' : 'Your Personal Vault'} • Total: {mediaList.length}
                    </p>
                </div>
                
                {!isAdminMode && (
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold tracking-widest uppercase transition-all shadow-md ${uploading ? 'bg-stone-100 text-stone-400 border border-stone-200' : 'bg-amber-600 hover:bg-amber-700 text-white hover:shadow-lg hover:-translate-y-0.5 active:scale-95'}`}
                    >
                        <UploadCloud size={18} /> {uploading ? 'Uploading...' : 'Add Asset'}
                    </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {mediaList.length > 0 ? mediaList.map((item) => (
                    <div key={item.mediaId} className="group relative bg-white border border-stone-200 rounded-[2rem] overflow-hidden hover:border-amber-200 hover:shadow-md transition-all duration-300 shadow-sm flex flex-col">
                        <div className="aspect-square bg-stone-50 overflow-hidden relative">
                            <img src={item.url} alt={item.altText} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                <button onClick={() => copyToClipboard(item.url)} className="bg-white text-slate-700 p-2.5 rounded-xl hover:text-amber-600 shadow-sm transition-all hover:scale-110" title="Copy URL">
                                    <Link size={18} />
                                </button>
                                <button onClick={() => deleteMedia(item.mediaId)} className="bg-white text-slate-700 p-2.5 rounded-xl hover:text-rose-600 shadow-sm transition-all hover:scale-110" title="Delete">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-1.5 bg-white border-t border-stone-100 flex-1">
                            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest truncate">{item.originalName}</p>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {/* ✅ Show Uploader ID only in Admin Mode */}
                                {isAdminMode ? (
                                    <span className="flex items-center gap-1"><User size={12} className="text-emerald-500"/> UID: {item.uploaderId}</span>
                                ) : (
                                    <span>{item.sizeKb} KB</span>
                                )}
                                <span>{item.mimeType.split('/')[1]}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 border-2 border-dashed border-stone-200 bg-stone-50 rounded-[3rem] flex flex-col items-center justify-center text-slate-400">
                        <div className="p-5 bg-white rounded-3xl shadow-sm mb-4"><ImageIcon size={48} className="text-amber-600 opacity-50" /></div>
                        <p className="font-bold tracking-wide text-xl text-center">No assets found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLibrary;