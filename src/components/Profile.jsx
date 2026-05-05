import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, Edit3, UploadCloud, Eye, EyeOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const userId = localStorage.getItem('userId');
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    
    const [profile, setProfile] = useState({ 
        fullName: '', username: '', bio: '', age: '', password: '', authProvider: 'LOCAL' 
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId || userId === "null") { setLoading(false); return; }
            try {
                const response = await api.get(`/auth/profile/${userId}`);
                setProfile({ ...response.data, password: '' });
                setPreviewUrl(response.data.profileImageUrl);
            } catch (err) {
                toast.error("Identity Sync Failed.");
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
        formData.append('username', profile.username);
        formData.append('bio', profile.bio || '');
        formData.append('age', profile.age || '');
        if (profile.authProvider === 'LOCAL' && profile.password) formData.append('password', profile.password);
        if (selectedFile) formData.append('image', selectedFile);

        try {
            const response = await api.put(`/auth/profile/${userId}/upload`, formData);
            setProfile(prev => ({ ...prev, ...response.data, password: '' }));
            setPreviewUrl(response.data.profileImageUrl);
            setIsEditMode(false);
            toast.success("Identity Updated! ✨");
        } catch (err) {
            toast.error("Update failed.");
        }
    };

    // Helper to render View Mode - Reduces Cognitive Complexity
    const renderViewMode = () => (
        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-48 h-48 rounded-full border border-border p-2 mb-8 shadow-md">
                <img 
                    src={previewUrl || `https://ui-avatars.com/api/?name=${profile.fullName}&background=d97706&color=fff`} 
                    className="w-full h-full object-cover rounded-full" 
                    alt="Avatar" 
                />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">{profile.fullName}</h2>
            <p className="text-primary font-medium text-base mb-8">@{profile.username || 'inkwell_user'}</p>
            <div className="flex gap-12 mb-10 border-y border-border py-6 w-full justify-center">
                <div className="text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Age</p>
                    <p className="text-xl font-bold text-foreground/80">{profile.age || '—'}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Vault</p>
                    <p className="text-xl font-bold text-primary">{profile.authProvider}</p>
                </div>
            </div>
            <p className="text-muted-foreground font-serif text-xl max-w-xl leading-relaxed">
                "{profile.bio || "No creative philosophy shared yet."}"
            </p>
        </div>
    );

    // Helper to render Edit Mode - Reduces Cognitive Complexity
    const renderEditMode = () => (
        <form onSubmit={handleUpdate} className="space-y-12 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center gap-6 bg-muted p-8 rounded-[2.5rem] border border-border shadow-inner">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                    <div className="w-40 h-40 rounded-full border border-border overflow-hidden bg-card shadow-sm transition group-hover:border-primary/30 group-hover:shadow-md">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition duration-300">
                        <UploadCloud size={28} className="text-primary" />
                    </div>
                    <input type="file" ref={fileInputRef} onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            setSelectedFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                        }
                    }} className="hidden" accept="image/*" />
                </div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Change Portrait</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label htmlFor="fullName" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                    <input id="fullName" type="text" value={profile.fullName} className="w-full bg-muted border border-border rounded-2xl p-5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-foreground transition-all shadow-sm" onChange={(e) => setProfile({...profile, fullName: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <label htmlFor="username" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Username</label>
                    <input id="username" type="text" value={profile.username} className="w-full bg-muted border border-border rounded-2xl p-5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-primary transition-all shadow-sm" onChange={(e) => setProfile({...profile, username: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label htmlFor="age" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Age</label>
                    <input id="age" type="number" value={profile.age} className="w-full bg-muted border border-border rounded-2xl p-5 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-foreground transition-all shadow-sm" onChange={(e) => setProfile({...profile, age: e.target.value})} />
                </div>
                <div className={`space-y-2 ${profile.authProvider === 'GOOGLE' ? 'opacity-50' : ''}`}>
                    <label htmlFor="password" className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                        <input 
                            id="password"
                            type={showPassword ? "text" : "password"} 
                            placeholder={profile.authProvider === 'GOOGLE' ? "Managed by Google" : "••••••••"}
                            disabled={profile.authProvider === 'GOOGLE'}
                            className="w-full bg-muted border border-border rounded-2xl p-5 pr-14 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-foreground transition-all shadow-sm"
                            onChange={(e) => setProfile({...profile, password: e.target.value})}
                        />
                        {profile.authProvider === 'LOCAL' && (
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle Password Visibility"
                                className="absolute right-5 top-[18px] text-muted-foreground hover:text-primary transition-colors z-10"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <button type="submit" className="w-full bg-foreground py-6 rounded-2xl font-bold uppercase text-background tracking-widest flex items-center justify-center gap-4 hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
                <Save size={20} /> Save InkWell Identity
            </button>
        </form>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                <div className="text-muted-foreground font-medium tracking-wide">Syncing Identity...</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-10 bg-card border border-border rounded-[3rem] mt-12 text-foreground shadow-sm mb-20 relative transition-colors duration-300">
            <div className="flex justify-between items-center mb-12">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition font-bold tracking-tight bg-muted hover:bg-muted/80 px-4 py-2 rounded-full border border-border">
                    <ArrowLeft size={16} /> Back
                </button>

                <button 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold tracking-wide transition-all shadow-sm ${isEditMode ? 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20' : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95'}`}
                >
                    {isEditMode ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Profile</>}
                </button>
            </div>

            {/* Flattened structure using conditional rendering functions */}
            {isEditMode ? renderEditMode() : renderViewMode()}
        </div>
    );
};

export default Profile;