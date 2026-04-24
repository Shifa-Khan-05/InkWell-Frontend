import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { User, Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ fullName: '', bio: '', profileImageUrl: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`http://localhost:8081/auth/profile/${userId}`);
                setProfile(response.data);
            } catch (err) { console.error("Profile load error:", err); }
        };
        if (userId) fetchProfile();
    }, [userId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`http://localhost:8081/auth/profile/${userId}`, profile);
            toast.success("Profile updated! ✨");
        } catch (err) {
            toast.error("Failed to update profile.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-gray-900 rounded-3xl border border-gray-800 mt-10 text-white shadow-2xl">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white mb-6 flex items-center gap-2 transition">
                <ArrowLeft size={18} /> Back
            </button>
            <h2 className="text-3xl font-bold mb-8 italic flex items-center gap-3">
                <User className="text-blue-500" /> My Profile
            </h2>
            <form onSubmit={handleUpdate} className="space-y-6">
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-black border-2 border-blue-500/50 overflow-hidden mb-4 shadow-lg">
                        <img 
                            src={profile.profileImageUrl || "https://via.placeholder.com/150"} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Image URL" 
                        className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-gray-400"
                        value={profile.profileImageUrl}
                        onChange={(e) => setProfile({...profile, profileImageUrl: e.target.value})}
                    />
                </div>
                <input 
                    type="text" 
                    value={profile.fullName} 
                    className="w-full bg-black border border-gray-800 rounded-xl p-4 focus:ring-1 focus:ring-blue-500 outline-none"
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    placeholder="Full Name"
                />
                <textarea 
                    value={profile.bio} 
                    className="w-full bg-black border border-gray-800 rounded-xl p-4 h-32 focus:ring-1 focus:ring-blue-500 outline-none"
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Write a short bio..."
                />
                <button type="submit" className="w-full bg-blue-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition">
                    <Save size={20} /> Save Profile
                </button>
            </form>
        </div>
    );
};

export default ProfileSettings;