import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Save, ArrowLeft, Edit3, UploadCloud, X, Lock, Eye, EyeOff } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const ProfileView = () => {
    const { id: targetUserId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role') || 'READER';
    const isPro = userRole.includes('PREMIUM') || userRole.includes('ADMIN');
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false); 
    const [isRestricted, setIsRestricted] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [savedCount, setSavedCount] = useState(0);
    
    const [profile, setProfile] = useState({ 
        fullName: '', username: '', bio: '', age: '', password: '', role: '', authProvider: '' 
    });
    usePageTitle(profile.fullName ? `Profile | ${profile.fullName}` : 'Profile');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const isOwnProfile = !targetUserId || targetUserId === userId;
    const isGoogleUser = profile.username?.toLowerCase().includes('google') || profile.authProvider === 'GOOGLE';

    useEffect(() => {
        const fetchProfile = async () => {
            const idToFetch = targetUserId || userId;
            if (!idToFetch || idToFetch === "null" || idToFetch === "undefined") { 
                setLoading(false); 
                return; 
            }

            // PRO FEATURE: Restrict viewing others' profiles
            if (!isOwnProfile && !isPro) {
                setIsRestricted(true);
                setLoading(false);
                return;
            }

            try {
                const userRes = await api.get(`/auth/profile/${idToFetch}`);
                setProfile({ ...userRes.data, password: '' });
                setPreviewUrl(userRes.data.profileImageUrl);

                // Fetch saved count separately
                try {
                    const savedRes = await api.get(`/posts/saved/${idToFetch}`);
                    setSavedCount(savedRes.data.length);
                } catch (e) {
                    console.warn("Could not fetch vault count");
                }

            } catch (err) {
                if (err.response?.status === 404) {
                    setNotFound(true);
                } else {
                    toast.error("Oops! We couldn't sync your identity right now. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId, targetUserId, isPro, isOwnProfile]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('fullName', profile.fullName);
        formData.append('bio', profile.bio || '');
        formData.append('age', profile.age || '');

        if (selectedFile) formData.append('image', selectedFile);
        if (!isGoogleUser && profile.password) formData.append('password', profile.password);

        try {
            const response = await api.put(`/auth/profile/${userId}/upload`, formData);
            setProfile(prev => ({ ...prev, ...response.data, password: '' }));
            setPreviewUrl(response.data.profileImageUrl);
            setIsEditMode(false);
            toast.success("Profile Protocol Updated! ✨");
        } catch (err) {
            toast.error("Oops! We couldn't update your profile right now. Please try again.");
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-background transition-colors duration-300">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground font-medium italic">Syncing InkWell Identity...</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-10 bg-card border border-border rounded-[3rem] mt-12 shadow-sm mb-20 relative overflow-hidden transition-colors duration-300">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-12 relative z-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground font-bold bg-muted px-4 py-2 rounded-full border border-border hover:bg-muted/80 transition-all">
                    <ArrowLeft size={16} /> Back
                </button>
                {isOwnProfile && (
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-sm ${isEditMode ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-foreground text-background hover:bg-foreground/90'}`}
                    >
                        {isEditMode ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Identity</>}
                    </button>
                )}
            </div>

            {notFound ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-8 shadow-inner">
                        <X size={40} />
                    </div>
                    <h2 className="text-3xl font-black mb-4 tracking-tighter">Identity Not Found</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-10 font-medium leading-relaxed">
                        The inkwell for this author has run dry, or the identity has been expunged from our records.
                    </p>
                    <button 
                        onClick={() => navigate('/browse')}
                        className="bg-foreground text-background px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg"
                    >
                        Return to Library
                    </button>
                </div>
            ) : isRestricted ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-8 shadow-inner">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-3xl font-black mb-4 tracking-tighter">Pro Access Required</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-10 font-medium leading-relaxed">
                        Viewing detailed author identities and philosophical bios is an exclusive Pro feature. 
                    </p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="bg-secondary text-secondary-foreground px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-secondary/20"
                    >
                        Unlock Pro Features
                    </button>
                </div>
            ) : !isEditMode ? (
                /* --- VIEW MODE --- */
                <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-48 h-48 rounded-full border border-border p-2 mb-8 shadow-md overflow-hidden bg-muted">
                        <img 
                            src={previewUrl ? (previewUrl.includes('localhost') ? (previewUrl.includes(':8084') ? previewUrl.replace(/http:\/\/localhost:8084\//, 'https://3.108.190.193.nip.io/auth/') : (previewUrl.includes(':8082') ? previewUrl.replace(/http:\/\/localhost:8082\//, 'https://3.108.190.193.nip.io/post/') : previewUrl.replace(/http:\/\/localhost:[0-9]+\//, 'https://3.108.190.193.nip.io/'))) : previewUrl) : `https://ui-avatars.com/api/?name=${profile.fullName}&background=d97706&color=fff`} 
                            className="w-full h-full object-cover rounded-full" 
                            alt="Avatar" 
                        />
                    </div>
                    <h2 className="text-4xl font-bold text-foreground tracking-tight mb-2">{profile.fullName}</h2>
                    <p className="text-primary font-medium mb-8">@{profile.username}</p>
                    
                    <div className="flex gap-12 mb-10 border-y border-border py-6 w-full justify-center">
                        <div className="text-center">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Age</p>
                            <p className="text-xl font-bold text-foreground">{profile.age || '—'}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Vault</p>
                            <p className="text-xl font-bold text-primary">{savedCount || '0'}</p>
                        </div>
                    </div>
                    
                    <p className="text-muted-foreground font-serif text-xl italic max-w-xl leading-relaxed">
                        "{profile.bio || "No creative philosophy shared yet."}"
                    </p>
                </div>
            ) : (
                /* --- EDIT MODE --- */
                <form onSubmit={handleUpdate} className="space-y-8 animate-in zoom-in-95 duration-300">
                    <div className="flex flex-col items-center gap-4 bg-muted p-6 rounded-[2.5rem] border border-border">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            <div className="w-32 h-32 rounded-full border-2 border-background overflow-hidden shadow-md bg-background">
                                <img src={previewUrl ? (previewUrl.includes('localhost') ? (previewUrl.includes(':8084') ? previewUrl.replace(/http:\/\/localhost:8084\//, 'https://3.108.190.193.nip.io/auth/') : (previewUrl.includes(':8082') ? previewUrl.replace(/http:\/\/localhost:8082\//, 'https://3.108.190.193.nip.io/post/') : previewUrl.replace(/http:\/\/localhost:[0-9]+\//, 'https://3.108.190.193.nip.io/'))) : previewUrl) : `https://ui-avatars.com/api/?name=${profile.fullName}&background=d97706&color=fff`} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <UploadCloud size={24} className="text-primary-foreground" />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                const file = e.target.files[0];
                                if(file) { 
                                    setSelectedFile(file); 
                                    setPreviewUrl(URL.createObjectURL(file)); 
                                }
                            }} />
                        </div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Change Portrait</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1 tracking-widest">Full Name</label>
                            <input 
                                type="text" 
                                value={profile.fullName} 
                                className="w-full bg-card border border-border rounded-2xl p-4 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm" 
                                onChange={(e) => setProfile({...profile, fullName: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1 tracking-widest">InkWell Username</label>
                            <input 
                                type="text" 
                                value={profile.username} 
                                disabled={isGoogleUser}
                                className={`w-full bg-card border border-border rounded-2xl p-4 font-bold text-primary outline-none transition-all shadow-sm ${isGoogleUser ? 'opacity-50 cursor-not-allowed' : 'focus:ring-4 focus:ring-primary/10 focus:border-primary'}`} 
                                onChange={(e) => setProfile({...profile, username: e.target.value})} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1 tracking-widest">Age (Solar Years)</label>
                            <input 
                                type="number" 
                                value={profile.age} 
                                className="w-full bg-card border border-border rounded-2xl p-4 font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm" 
                                onChange={(e) => setProfile({...profile, age: e.target.value})} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase ml-1 tracking-widest">Vault Status</label>
                            <div className="w-full bg-muted border border-border rounded-2xl p-4 font-bold text-muted-foreground flex items-center justify-between">
                                <span>{savedCount} Saved Manuscripts</span>
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded">SYNCED</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1 tracking-widest">Creative Philosophy</label>
                        <textarea 
                            className="w-full bg-card border border-border rounded-3xl p-6 h-32 outline-none font-serif text-lg text-foreground shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" 
                            value={profile.bio} 
                            placeholder="Share your creative philosophy..."
                            onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                        />
                    </div>

                    {/* ✅ PASSWORD FIELD: Hidden if Google User with Eye Toggle */}
                    {!isGoogleUser && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Update Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={profile.password} 
                                        placeholder="Enter new password" 
                                        className="w-full bg-card border border-border rounded-2xl p-4 pl-12 pr-12 text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm" 
                                        onChange={(e) => setProfile({...profile, password: e.target.value})} 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end mt-2">
                                <Link to="/reset-password" className="text-xs font-bold text-primary hover:underline hover:text-primary/80 transition-colors">Forgot password? Reset it here</Link>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-foreground py-5 rounded-2xl font-bold text-background uppercase hover:bg-foreground/90 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
                        <Save size={20} /> Save InkWell Identity
                    </button>
                </form>
            )}
        </div>
    );
};

export default ProfileView;