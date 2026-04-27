import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, Edit3, UploadCloud, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileView = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const userId = localStorage.getItem('userId');
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false); // ✅ Added state for eye icon
    
    const [profile, setProfile] = useState({ 
        fullName: '', username: '', bio: '', age: '', password: '', role: '', authProvider: '' 
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // ✅ Logic: Detect if user joined via Google (checks username or a specific flag)
    const isGoogleUser = profile.username?.toLowerCase().includes('google') || profile.authProvider === 'GOOGLE';

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) { setLoading(false); return; }
            try {
                const response = await api.get(`/auth/profile/${userId}`);
                setProfile({ ...response.data, password: '' });
                setPreviewUrl(response.data.profileImageUrl);
            } catch (err) {
                toast.error("Identity Sync Failed. Please check backend services.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('fullName', profile.fullName);
        formData.append('bio', profile.bio || '');
        formData.append('age', profile.age || ''); // ✅ Age saving logic

        if (selectedFile) formData.append('image', selectedFile);
        if (!isGoogleUser && profile.password) formData.append('password', profile.password);

        try {
            const response = await api.put(`/auth/profile/${userId}/upload`, formData);
            setProfile(prev => ({ ...prev, ...response.data, password: '' }));
            setPreviewUrl(response.data.profileImageUrl);
            setIsEditMode(false);
            toast.success("Profile Protocol Updated! ✨");
        } catch (err) {
            toast.error("Update failed: Service Unreachable.");
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-stone-50">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium italic">Syncing InkWell Identity...</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-10 bg-white border border-stone-100 rounded-[3rem] mt-12 shadow-sm mb-20 relative overflow-hidden">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-12 relative z-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold bg-stone-50 px-4 py-2 rounded-full border border-stone-200 hover:bg-stone-100 transition-all">
                    <ArrowLeft size={16} /> Back
                </button>
                <button 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-sm ${isEditMode ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                    {isEditMode ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Identity</>}
                </button>
            </div>

            {!isEditMode ? (
                /* --- VIEW MODE --- */
                <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-48 h-48 rounded-full border border-stone-200 p-2 mb-8 shadow-md overflow-hidden bg-stone-50">
                        <img 
                            src={previewUrl || `https://ui-avatars.com/api/?name=${profile.fullName}&background=d97706&color=fff`} 
                            className="w-full h-full object-cover rounded-full" 
                            alt="Avatar" 
                        />
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">{profile.fullName}</h2>
                    <p className="text-amber-600 font-medium mb-8">@{profile.username}</p>
                    
                    <div className="flex gap-12 mb-10 border-y border-stone-100 py-6 w-full justify-center">
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Age</p>
                            <p className="text-xl font-bold text-slate-700">{profile.age || '—'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xl font-bold text-emerald-600">{profile.role?.replace('ROLE_', '') || 'READER'}</p>
                        </div>
                    </div>
                    
                    <p className="text-slate-600 font-serif text-xl italic max-w-xl leading-relaxed">
                        "{profile.bio || "No philosophy penned yet."}"
                    </p>
                </div>
            ) : (
                /* --- EDIT MODE --- */
                <form onSubmit={handleUpdate} className="space-y-8 animate-in zoom-in-95 duration-300">
                    <div className="flex flex-col items-center gap-4 bg-stone-50 p-6 rounded-[2.5rem] border border-stone-200">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            <div className="w-32 h-32 rounded-full border-2 border-white overflow-hidden shadow-md bg-white">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-amber-600/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <UploadCloud size={24} className="text-white" />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                const file = e.target.files[0];
                                if(file) { 
                                    setSelectedFile(file); 
                                    setPreviewUrl(URL.createObjectURL(file)); 
                                }
                            }} />
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Change Portrait</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                            <input 
                                type="text" 
                                value={profile.fullName} 
                                className="w-full bg-white border border-stone-200 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm" 
                                onChange={(e) => setProfile({...profile, fullName: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Age</label>
                            <input 
                                type="number" 
                                value={profile.age} 
                                className="w-full bg-white border border-stone-200 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm" 
                                onChange={(e) => setProfile({...profile, age: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Bio</label>
                        <textarea 
                            className="w-full bg-white border border-stone-200 rounded-3xl p-6 h-32 outline-none font-serif text-lg text-slate-700 shadow-sm focus:border-amber-500 transition-all" 
                            value={profile.bio} 
                            onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                        />
                    </div>

                    {/* ✅ PASSWORD FIELD: Hidden if Google User with Eye Toggle */}
                    {!isGoogleUser && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Update Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    value={profile.password} 
                                    placeholder="Enter new password" 
                                    className="w-full bg-white border border-stone-200 rounded-2xl p-4 pl-12 pr-12 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm" 
                                    onChange={(e) => setProfile({...profile, password: e.target.value})} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-slate-900 py-5 rounded-2xl font-bold text-white uppercase hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
                        <Save size={20} /> Save InkWell Identity
                    </button>
                </form>
            )}
        </div>
    );
};

export default ProfileView;