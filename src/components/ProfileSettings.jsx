import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, User, UploadCloud, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const userId = localStorage.getItem('userId');
    
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [profile, setProfile] = useState({ 
        fullName: '', 
        username: '', 
        bio: '', 
        age: '', 
        password: '',
        authProvider: 'LOCAL' // Default to local
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId || userId === "null") {
                setLoading(false);
                return;
            }
            try {
                // Hits http://localhost:8080/auth/profile/...
                const response = await api.get(`/auth/profile/${userId}`);
                setProfile({
                    fullName: response.data.fullName || '',
                    username: response.data.username || '',
                    bio: response.data.bio || '',
                    age: response.data.age || '',
                    password: '', // Keep empty for security unless editing
                    authProvider: response.data.authProvider || 'LOCAL'
                });
                setPreviewUrl(response.data.profileImageUrl);
            } catch (err) {
                console.error("Profile fetch error:", err);
                toast.error("Identity Sync Failed.");
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
                toast.error("Image must be under 2MB.");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('fullName', profile.fullName);
        formData.append('username', profile.username);
        formData.append('bio', profile.bio || '');
        formData.append('age', profile.age || '');
        
        // Only append password if it's a local user and they typed something
        if (profile.authProvider === 'LOCAL' && profile.password) {
            formData.append('password', profile.password);
        }
        
        if (selectedFile) {
            formData.append('image', selectedFile);
        }

        try {
            const response = await api.put(`/auth/profile/${userId}/upload`, formData);
            setProfile(prev => ({ ...prev, ...response.data, password: '' }));
            setPreviewUrl(response.data.profileImageUrl);
            toast.success("Identity Updated Successfully! ✨");
        } catch (err) {
            toast.error("Update failed. Check file size or network.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                <div className="text-muted-foreground font-medium tracking-wide">Syncing Settings...</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-10 bg-card border border-border rounded-[3rem] mt-12 text-foreground shadow-sm mb-20 relative overflow-hidden transition-colors duration-300">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-all group font-bold tracking-tight bg-muted hover:bg-muted/80 px-4 py-2 rounded-full border border-border">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>

            <div className="flex justify-between items-start mb-12">
                <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-4 tracking-tight">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary"><User size={28} /></div> Identity Control
                </h2>
                {profile.authProvider === 'GOOGLE' && (
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl text-blue-500 text-xs font-bold uppercase tracking-wider shadow-sm">
                        <ShieldCheck size={16} /> Verified via Google
                    </div>
                )}
            </div>

            <form onSubmit={handleUpdate} className="space-y-10 animate-in zoom-in-95 duration-300">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 bg-muted p-8 rounded-[2.5rem] border border-border shadow-inner">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                        <div className="w-32 h-32 rounded-full border border-border overflow-hidden bg-card shadow-sm transition group-hover:border-primary/30 group-hover:shadow-md">
                            <img 
                                src={previewUrl || `https://ui-avatars.com/api/?name=${profile.fullName || 'User'}&background=d97706&color=fff`} 
                                alt="Avatar" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition duration-300">
                            <UploadCloud size={28} className="text-primary mb-1" />
                            <span className="text-[10px] font-bold uppercase text-primary tracking-wider">Update Photo</span>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" aria-label="Update Avatar" />
                    </div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Manuscript Portrait</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="fullName" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                                id="fullName"
                                type="text" 
                                value={profile.fullName} 
                                className="w-full bg-muted border border-border rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-foreground transition-all shadow-sm"
                                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Username</label>
                            <input 
                                id="username"
                                type="text" 
                                value={profile.username} 
                                className="w-full bg-muted border border-border rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-primary transition-all shadow-sm"
                                onChange={(e) => setProfile({...profile, username: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Sensitive / Metadata */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="age" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Age</label>
                            <input 
                                id="age"
                                type="number" 
                                value={profile.age} 
                                className="w-full bg-muted border border-border rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-foreground transition-all shadow-sm"
                                onChange={(e) => setProfile({...profile, age: e.target.value})}
                            />
                        </div>
                        
                        {/* Password Field: Only for Local Users */}
                        <div className={`space-y-2 ${profile.authProvider === 'GOOGLE' ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                {profile.authProvider === 'GOOGLE' ? 'Password Locked' : 'Update Password'}
                            </label>
                            <div className="relative">
                                <input 
                                    id="password"
                                    type={showPassword ? "text" : "password"} 
                                    placeholder={profile.authProvider === 'GOOGLE' ? "Linked to Google" : "Leave blank to keep current"}
                                    value={profile.password}
                                    className="w-full bg-muted border border-border rounded-2xl p-4 pr-12 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-foreground transition-all shadow-sm placeholder:text-muted-foreground/40"
                                    onChange={(e) => setProfile({...profile, password: e.target.value})}
                                />
                                {profile.authProvider === 'LOCAL' && (
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-4 text-muted-foreground hover:text-primary transition-colors z-10"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="bio" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Creative Philosophy (Bio)</label>
                    <textarea 
                        id="bio"
                        className="w-full bg-muted border border-border rounded-3xl p-6 h-32 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-serif text-lg text-foreground transition-all shadow-sm placeholder:text-muted-foreground/40"
                        value={profile.bio}
                        placeholder="Share your creative thoughts..."
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-foreground py-5 rounded-2xl font-bold uppercase text-background tracking-widest flex items-center justify-center gap-3 hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                >
                    <Save size={20} /> Save InkWell Identity
                </button>
            </form>
        </div>
    );
};

export default ProfileSettings;