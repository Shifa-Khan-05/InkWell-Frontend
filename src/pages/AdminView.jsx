import React, { useState, useEffect } from 'react';
import { Shield, Trash2, UserCheck, ShieldAlert, Activity, Globe, PlusCircle, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminView = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, totalComments: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [userRes, postRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/posts/published') 
            ]);
            
            setUsers(userRes.data);
            setStats({
                totalUsers: userRes.data.length,
                totalPosts: postRes.data.length,
                totalComments: "Verified" 
            });
        } catch (err) {
            toast.error("Access Denied: Admin Security clearance required.");
        } finally {
            setLoading(false);
        }
    };

    // Requirement 2.5: Standard Role Toggle (Reader <-> Author)
    const handleRoleChange = async (userId, currentRole) => {
        const nextRole = currentRole === 'ROLE_READER' ? 'AUTHOR' : 'READER';
        try {
            await api.put(`/auth/users/${userId}/role?newRole=${nextRole}`);
            toast.success(`User updated to ${nextRole} successfully! ✨`);
            fetchAdminData();
        } catch (err) { 
            toast.error("Role update failed."); 
        }
    };

    // ✅ NEW: Specific Admin Promotion Logic
    const handlePromoteToAdmin = async (userId) => {
        if (window.confirm("SECURITY ESCALATION: Grant full Administrative privileges to this user? This allows total system control.")) {
            try {
                await api.put(`/auth/users/${userId}/role?newRole=ADMIN`);
                toast.success("User promoted to System Admin! 🛡️");
                fetchAdminData();
            } catch (err) {
                toast.error("Privilege escalation failed.");
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("CRITICAL: Permanently terminate this identity? This action is irreversible.")) {
            try {
                await api.delete(`/auth/users/${userId}`);
                toast.error("Account purged from database.");
                fetchAdminData();
            } catch (err) {
                toast.error("Deletion protocol failed.");
            }
        }
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <ShieldAlert className="text-red-500 animate-pulse" size={48} />
            <p className="text-red-500 font-mono tracking-tighter uppercase">Initializing Admin Command Center...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Admin Header with "Add New" action */}
            <div className="flex justify-between items-end border-b border-gray-800 pb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <ShieldCheck className="text-red-600" size={36}/> System Control
                    </h1>
                    <p className="text-gray-500 font-medium">Manage platform identities and privilege levels.</p>
                </div>
                <button 
                    onClick={() => navigate('/register')}
                    className="bg-red-600 px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:bg-red-700 transition shadow-lg shadow-red-600/20"
                >
                    <PlusCircle size={18} /> Provision New Admin
                </button>
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-red-600/10 border border-red-500/20 rounded-[30px] flex items-center gap-5">
                    <ShieldAlert className="text-red-500" size={40} />
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-red-500/60">Registered Users</p>
                        <h3 className="text-3xl font-black">{stats.totalUsers}</h3>
                    </div>
                </div>
                <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[30px] flex items-center gap-5">
                    <Globe className="text-blue-500" size={40} />
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-blue-500/60">Platform Content</p>
                        <h3 className="text-3xl font-black">{stats.totalPosts}</h3>
                    </div>
                </div>
                <div className="p-6 bg-purple-600/10 border border-purple-500/20 rounded-[30px] flex items-center gap-5">
                    <Activity className="text-purple-500" size={40} />
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-purple-500/60">Server Matrix</p>
                        <h3 className="text-xl font-black text-green-500 uppercase tracking-tighter">Active</h3>
                    </div>
                </div>
            </div>

            {/* User Table */}
            <div className="bg-gray-950 border border-gray-800 rounded-[40px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-black/80 text-[10px] uppercase tracking-widest text-gray-500">
                        <tr>
                            <th className="px-8 py-6">User Identity</th>
                            <th className="px-8 py-6 text-center">Privileges</th>
                            <th className="px-8 py-6 text-center">System Protocols</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                        {users.map(user => (
                            <tr key={user.userId} className="hover:bg-red-500/5 transition group">
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white text-lg">{user.fullName}</span>
                                        <span className="text-xs text-gray-600 font-mono">{user.email}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-tighter border ${
                                        user.role === 'ROLE_ADMIN' 
                                        ? 'border-red-500 text-red-500 bg-red-500/5' 
                                        : user.role === 'ROLE_AUTHOR' 
                                        ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                                        : 'border-blue-500 text-blue-400 bg-blue-500/5'
                                    }`}>
                                        {user.role.replace('ROLE_', '')}
                                    </span>
                                </td>
                                <td className="px-8 py-5 flex justify-center gap-4">
                                    {/* Author Toggle */}
                                    <button 
                                        onClick={() => handleRoleChange(user.userId, user.role)}
                                        className="p-3 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500 hover:text-blue-500 hover:border-blue-500/50 transition"
                                        title="Toggle Reader/Author"
                                    >
                                        <UserCheck size={20}/>
                                    </button>

                                    {/* Admin Promotion Button */}
                                    {user.role !== 'ROLE_ADMIN' && (
                                        <button 
                                            onClick={() => handlePromoteToAdmin(user.userId)}
                                            className="p-3 bg-red-900/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition"
                                            title="Promote to System Admin"
                                        >
                                            <Shield size={20}/>
                                        </button>
                                    )}

                                    {/* Delete Button */}
                                    <button 
                                        onClick={() => handleDeleteUser(user.userId)}
                                        className="p-3 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500 hover:text-red-500 hover:border-red-500/50 transition"
                                    >
                                        <Trash2 size={20}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminView;