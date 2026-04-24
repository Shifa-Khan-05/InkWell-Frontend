import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, User, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    // Safety: Ensure userId is a real value, not string "null" or "undefined"
    const rawUserId = localStorage.getItem('userId');
    const userId = (rawUserId === "null" || rawUserId === "undefined" || !rawUserId) ? null : rawUserId;
    
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({ fullName: '', bio: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Fetch profile data through the Gateway (port 8080)
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                // Using relative path to hit http://localhost:8080/auth/profile/...
                const response = await api.get(`/auth/profile/${userId}`);
                setProfile({
                    fullName: response.data.fullName || '',
                    bio: response.data.bio || ''
                });
                setPreviewUrl(response.data.profileImageUrl);
            } catch (err) {
                console.error("Profile fetch error:", err);
                toast.error("Failed to load profile details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Image too large. Please pick a file under 2MB.");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (!userId) {
            toast.error("Session expired. Please login again.");
            return;
        }

        const formData = new FormData();
        formData.append('fullName', profile.fullName);
        formData.append('bio', profile.bio || '');
        
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        try {
            // Talk directly to the Gateway instance. 
            // Interceptor in axios.js will handle the boundary headers.
            const response = await api.put(`/auth/profile/${userId}/upload`, formData);
            
            setProfile({
                fullName: response.data.fullName,
                bio: response.data.bio
            });
            setPreviewUrl(response.data.profileImageUrl);
            toast.success("Profile Updated Successfully! ✨");
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Update failed. Check your network or file size.");
        }
    };

    if (!userId) return (
        <div className="p-20 text-center text-white bg-black min-h-screen">
            <User className="mx-auto text-gray-700 mb-4" size={64} />
            <p className="mb-6 text-gray-400">Please sign in to manage your InkWell Identity.</p>
            <button onClick={() => navigate('/login')} className="bg-blue-600 px-8 py-3 rounded-xl font-bold">Login Now</button>
        </div>
    );

    if (loading) return <div className="p-20 text-center text-blue-500 font-mono animate-pulse italic">Syncing Profile...</div>;

    return (
        <div className="max-w-2xl mx-auto p-10 bg-gray-900 border border-gray-800 rounded-3xl mt-12 text-white shadow-2xl animate-in fade-in duration-500">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition"
            >
                <ArrowLeft size={18} /> Back
            </button>

            <h2 className="text-3xl font-black italic mb-10 flex items-center gap-3 underline underline-offset-8 decoration-blue-500">
                <User className="text-blue-500" size={32} /> Edit Profile
            </h2>

            <form onSubmit={handleUpdate} className="space-y-10">
                <div className="flex flex-col items-center gap-6">
                    <div 
                        className="relative group cursor-pointer" 
                        onClick={() => fileInputRef.current.click()}
                    >
                        <div className="w-44 h-44 rounded-full border-4 border-blue-600/20 overflow-hidden bg-black shadow-2xl transition group-hover:border-blue-500 duration-500">
                            <img 
                                src={previewUrl || `https://ui-avatars.com/api/?name=${profile.fullName || 'User'}&background=random`} 
                                alt="Avatar" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        
                        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition duration-300">
                            <UploadCloud size={32} className="text-white mb-2" />
                            <span className="text-[10px] font-black uppercase text-blue-400">Browse Files</span>
                        </div>

                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden" 
                            accept="image/*"
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic">Click circle to browse images</p>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                        <input 
                            type="text" 
                            value={profile.fullName} 
                            className="w-full bg-black border border-gray-800 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-blue-500 transition font-bold text-white"
                            onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Bio / Philosophy</label>
                        <textarea 
                            placeholder="Share your creative philosophy..." 
                            className="w-full bg-black border border-gray-800 rounded-2xl p-4 h-44 outline-none focus:ring-1 focus:ring-blue-500 font-serif text-gray-300 leading-relaxed"
                            value={profile.bio}
                            onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition shadow-lg active:scale-95 shadow-blue-500/20"
                >
                    <Save size={20} /> Save InkWell Profile
                </button>
            </form>
        </div>
    );
};

export default Profile;