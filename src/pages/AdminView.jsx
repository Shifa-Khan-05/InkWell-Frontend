import React, { useState, useEffect } from 'react';
import { Shield, Trash2, UserCheck, ShieldAlert, Activity, Globe, PlusCircle, ShieldCheck, MessageSquare, Mail, TrendingUp } from 'lucide-react';
import api, { webApi } from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminView = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, platformStatus: "Initializing" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            // ✅ Fetching aggregated metrics from Website-Controller (BFF)
            const res = await webApi.get('/admin/summary');
            setUsers(res.data.users);
            setStats({
                totalUsers: res.data.users.length,
                totalPosts: res.data.totalPosts,
                platformStatus: res.data.platformStatus || "Operational"
            });
        } catch (err) {
            toast.error("Command Center Access Denied.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendDirectMail = async (userEmail) => {
        const subject = window.prompt("Email Subject:", "InkWell Platform Notice");
        const body = window.prompt("Write your styled message:");
        if (!body) return;

        try {
            await api.post('/newsletter/direct-mail', {
                email: userEmail,
                subject,
                title: "Official Correspondence",
                body
            });
            toast.success("Styled manuscript transmitted! 📧");
        } catch (err) {
            toast.error("Transmission failed.");
        }
    };

    const handleRoleChange = async (userId, currentRole) => {
        const nextRole = currentRole === 'ROLE_READER' ? 'AUTHOR' : 'READER';
        try {
            await api.put(`/auth/users/${userId}/role?newRole=${nextRole}`);
            toast.success("Role protocol updated! ✨");
            fetchAdminData();
        } catch (err) { toast.error("Role update failed."); }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to completely erase this identity?")) return;
        try {
            await api.delete(`/auth/users/${userId}`);
            toast.success("Identity erased successfully.");
            fetchAdminData();
        } catch (err) {
            toast.error("Failed to erase identity.");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center animate-pulse text-slate-400">Loading Command Center...</div>;

    return (
        <div className="space-y-10 p-4">
            <div className="flex justify-between items-end border-b border-stone-200 pb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4 text-slate-900">
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-600"><ShieldCheck size={28}/></div> System Control
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">Overseeing platform integrity and narrative growth.</p>
                </div>
                <button onClick={() => navigate('/register')} className="bg-rose-600 px-6 py-3.5 rounded-xl font-bold text-white flex items-center gap-2 hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-600/20">
                    <PlusCircle size={18} /> Provision New Admin
                </button>
            </div>

            {/* ✅ Analytics Command Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-white border border-stone-200 rounded-[2.5rem] shadow-sm hover:border-amber-200 transition-all group">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><TrendingUp size={24} /></div>
                    <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Identity Reach</p>
                    <h3 className="text-4xl font-bold text-slate-900">{stats.totalUsers} <span className="text-sm font-normal text-slate-400">Users</span></h3>
                </div>
                <div className="p-8 bg-white border border-stone-200 rounded-[2.5rem] shadow-sm hover:border-blue-200 transition-all group">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><Globe size={24} /></div>
                    <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Narrative Volume</p>
                    <h3 className="text-4xl font-bold text-slate-900">{stats.totalPosts} <span className="text-sm font-normal text-slate-400">Posts</span></h3>
                </div>
                <div className="p-8 bg-white border border-stone-200 rounded-[2.5rem] shadow-sm hover:border-emerald-200 transition-all group">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><Activity size={24} /></div>
                    <p className="text-xs uppercase font-bold tracking-widest text-slate-400">System Health</p>
                    <h3 className="text-4xl font-bold text-emerald-600">{stats.platformStatus}</h3>
                </div>
            </div>

            {/* Identity Management Table */}
            <div className="bg-white border border-stone-200 rounded-[3rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 text-xs font-bold uppercase tracking-widest text-slate-400">
                        <tr>
                            <th className="px-10 py-6">User Identity</th>
                            <th className="px-10 py-6 text-center">Privileges</th>
                            <th className="px-10 py-6 text-right pr-12">System Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {users.map(user => (
                            <tr key={user.userId || user.id} className="hover:bg-stone-50/50 transition-colors group">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                                            <img src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=f8fafc&color=64748b`} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-lg">{user.fullName}</span>
                                            <span className="text-xs text-slate-400 font-medium tracking-tight uppercase">{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${user.role === 'ROLE_ADMIN' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-stone-50 text-slate-600 border-stone-100'}`}>
                                        {user.role?.replace('ROLE_', '')}
                                    </span>
                                </td>
                                <td className="px-10 py-6 text-right pr-12">
                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <button onClick={() => handleSendDirectMail(user.email)} className="p-2.5 bg-white border border-stone-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm" title="Dispatch Styled Email"><Mail size={18}/></button>
                                        <button onClick={() => handleRoleChange(user.userId || user.id, user.role)} className="p-2.5 bg-white border border-stone-200 rounded-xl text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm"><UserCheck size={18}/></button>
                                        <button onClick={() => handleDeleteUser(user.userId || user.id)} className="p-2.5 bg-white border border-stone-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"><Trash2 size={18}/></button>
                                    </div>
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