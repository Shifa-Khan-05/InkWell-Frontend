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

    if (loading) return <div className="p-10 text-center text-blue-500 animate-pulse font-mono uppercase text-xs">Accessing Media Vault...</div>;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-800 pb-8">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-white">
                        <ImageIcon className="text-blue-500" /> {isAdminMode ? 'Global Assets' : 'Media Library'}
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                        {isAdminMode ? 'System-wide Repository' : 'Your Personal Vault'} • Total: {mediaList.length}
                    </p>
                </div>
                
                {!isAdminMode && (
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase text-xs transition shadow-xl ${uploading ? 'bg-gray-800 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'}`}
                    >
                        <UploadCloud size={18} /> {uploading ? 'Uploading...' : 'Add New Asset'}
                    </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {mediaList.length > 0 ? mediaList.map((item) => (
                    <div key={item.mediaId} className="group relative bg-gray-900 border border-gray-800 rounded-[24px] overflow-hidden hover:border-blue-500/50 transition-all duration-300">
                        <div className="aspect-square bg-black overflow-hidden relative">
                            <img src={item.url} alt={item.altText} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                <button onClick={() => copyToClipboard(item.url)} className="bg-white/10 p-3 rounded-full hover:bg-blue-600 transition text-white" title="Copy URL">
                                    <Link size={18} />
                                </button>
                                <button onClick={() => deleteMedia(item.mediaId)} className="bg-white/10 p-3 rounded-full hover:bg-red-600 transition text-white" title="Delete">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-1">
                            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest truncate">{item.originalName}</p>
                            <div className="flex justify-between items-center text-[9px] text-gray-600 font-bold uppercase">
                                {/* ✅ Show Uploader ID only in Admin Mode */}
                                {isAdminMode ? (
                                    <span className="flex items-center gap-1 text-purple-400"><User size={10}/> UID: {item.uploaderId}</span>
                                ) : (
                                    <span>{item.sizeKb} KB</span>
                                )}
                                <span>{item.mimeType.split('/')[1]}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-32 border-2 border-dashed border-gray-900 rounded-[40px] flex flex-col items-center justify-center text-gray-700">
                        <ImageIcon size={48} className="mb-4 opacity-20" />
                        <p className="font-black italic uppercase tracking-tighter text-xl text-center">No assets found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLibrary;