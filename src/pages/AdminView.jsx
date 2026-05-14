import React, { useState, useEffect } from 'react';
import { Trash2, UserCheck, Activity, Globe, PlusCircle, ShieldCheck, Mail, TrendingUp, Users, MoreHorizontal } from 'lucide-react';
import api, { webApi } from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const AdminView = () => {
    usePageTitle('Admin Control');
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [roleRequests, setRoleRequests] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, platformStatus: "Initializing" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const res = await webApi.get('/admin/summary');
            setUsers(res.data.users || []);
            setStats({
                totalUsers: (res.data.users || []).length,
                totalPosts: res.data.totalPosts || 0,
                platformStatus: res.data.platformStatus || "Operational"
            });
            
            try {
                const roleReqRes = await api.get('/auth/role-requests');
                setRoleRequests((roleReqRes.data || []).filter(r => r.status?.toUpperCase() === 'PENDING'));
            } catch (roleErr) {
                console.error("Role requests fetch failed");
            }
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

    const handleProcessRoleRequest = async (requestId, status) => {
        try {
            await api.put(`/auth/role-requests/${requestId}?status=${status}`);
            toast.success(`Role request ${status.toLowerCase()}!`);
            fetchAdminData();
        } catch (err) {
            toast.error("Failed to process request.");
        }
    };

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-muted-foreground animate-pulse">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
            <p className="font-bold tracking-widest uppercase text-xs">Syncing Command Center</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-12 max-w-7xl mx-auto px-2 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter flex items-center gap-4 text-foreground">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary"><ShieldCheck size={32}/></div> System Control
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-md">Overseeing platform integrity, user narratives, and identity verification protocols.</p>
                </div>
                <button onClick={() => navigate('/register')} className="w-full md:w-auto bg-primary px-8 py-4 rounded-2xl font-bold text-primary-foreground flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20">
                    <PlusCircle size={20} /> Provision Admin
                </button>
            </div>

            {/* ✅ Responsive Analytics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Users size={80} /></div>
                    <div className="p-4 bg-primary/10 text-primary rounded-2xl w-fit mb-4"><TrendingUp size={24} /></div>
                    <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60 mb-1">Identity Reach</p>
                    <h3 className="text-4xl font-bold text-foreground">{stats.totalUsers} <span className="text-sm font-normal text-muted-foreground">Users</span></h3>
                </div>
                <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Globe size={80} /></div>
                    <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mb-4"><Globe size={24} /></div>
                    <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60 mb-1">Narrative Volume</p>
                    <h3 className="text-4xl font-bold text-foreground">{stats.totalPosts} <span className="text-sm font-normal text-muted-foreground">Posts</span></h3>
                </div>
                <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-sm hover:shadow-md transition-all group relative overflow-hidden sm:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Activity size={80} /></div>
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl w-fit mb-4"><Activity size={24} /></div>
                    <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60 mb-1">System Health</p>
                    <h3 className={`text-4xl font-bold ${stats.platformStatus === 'DEGRADED' ? 'text-amber-500' : 'text-emerald-600'}`}>{stats.platformStatus}</h3>
                </div>
            </div>

            {/* Role Requests Management */}
            {roleRequests.length > 0 && (
                <div className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-sm">
                    <h2 className="px-8 sm:px-10 py-6 text-xl font-bold bg-muted/20 border-b border-border text-foreground flex items-center gap-3">
                        <ShieldCheck size={20} className="text-blue-500" /> Pending Role Upgrades
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-muted/50 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                <tr>
                                    <th className="px-8 sm:px-10 py-5">User</th>
                                    <th className="px-8 sm:px-10 py-5 text-center">Requested Role</th>
                                    <th className="px-8 sm:px-10 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {roleRequests.map(req => (
                                    <tr key={req.requestId} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-8 sm:px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground text-lg">{req.user?.fullName || "Unknown"}</span>
                                                <span className="text-xs text-muted-foreground font-medium">{req.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 sm:px-10 py-6 text-center">
                                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                {req.requestedRole?.replace('ROLE_', '')}
                                            </span>
                                        </td>
                                        <td className="px-8 sm:px-10 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleProcessRoleRequest(req.requestId, 'APPROVED')} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-bold text-xs shadow-sm active:scale-95">Approve</button>
                                                <button onClick={() => handleProcessRoleRequest(req.requestId, 'REJECTED')} className="px-5 py-2.5 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-all font-bold text-xs active:scale-95">Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Identity Management Section */}
            <div className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-sm">
                <div className="px-8 sm:px-10 py-6 flex justify-between items-center bg-muted/20 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-3"><Users size={20} className="text-primary"/> Identity Management</h2>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{users.length} Identities Managed</span>
                </div>

                {/* Mobile View: Cards */}
                <div className="block lg:hidden divide-y divide-border/50">
                    {users.map(user => (
                        <div key={user.userId || user.id} className="p-6 space-y-4 hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-muted overflow-hidden border-2 border-border shadow-sm">
                                    <img src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=f8fafc&color=64748b`} className="w-full h-full object-cover" alt=""/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/profile/${user.userId || user.id}`}>
                                        <h4 className="font-bold text-foreground text-lg truncate hover:text-primary transition-colors">{user.fullName}</h4>
                                    </Link>
                                    <p className="text-xs text-muted-foreground truncate font-medium">{user.email}</p>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${user.role === 'ROLE_ADMIN' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                        {user.role?.replace('ROLE_', '')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => handleSendDirectMail(user.email)} className="flex-1 py-3 bg-muted rounded-xl text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 font-bold text-xs"><Mail size={16}/> Email</button>
                                <button onClick={() => handleRoleChange(user.userId || user.id, user.role)} className="flex-1 py-3 bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 font-bold text-xs"><UserCheck size={16}/> Role</button>
                                <button onClick={() => handleDeleteUser(user.userId || user.id)} className="p-3 bg-destructive/10 rounded-xl text-destructive hover:bg-destructive/20 transition-all"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                            <tr>
                                <th className="px-10 py-6">Identity</th>
                                <th className="px-10 py-6 text-center">Authorization</th>
                                <th className="px-10 py-6 text-right">System Protocols</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {users.map(user => (
                                <tr key={user.userId || user.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-muted overflow-hidden border-2 border-border group-hover:border-primary/30 transition-all shadow-sm">
                                                <img src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=f8fafc&color=64748b`} className="w-full h-full object-cover" alt=""/>
                                            </div>
                                            <div className="flex flex-col">
                                                <Link to={`/profile/${user.userId || user.id}`}>
                                                    <span className="font-bold text-foreground text-lg tracking-tight hover:text-primary transition-colors">{user.fullName}</span>
                                                </Link>
                                                <span className="text-xs text-muted-foreground font-medium tracking-tight uppercase">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'ROLE_ADMIN' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                            {user.role?.replace('ROLE_', '')}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <button onClick={() => handleSendDirectMail(user.email)} className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm" title="Dispatch Styled Email"><Mail size={18}/></button>
                                            <button onClick={() => handleRoleChange(user.userId || user.id, user.role)} className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-secondary-foreground hover:border-secondary/30 transition-all shadow-sm" title="Toggle Author/Reader"><UserCheck size={18}/></button>
                                            <button onClick={() => handleDeleteUser(user.userId || user.id)} className="p-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all shadow-sm" title="Erase Identity"><Trash2 size={18}/></button>
                                        </div>
                                        <div className="group-hover:hidden text-muted-foreground opacity-20"><MoreHorizontal size={20} className="ml-auto" /></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="py-24 text-center text-muted-foreground font-medium flex flex-col items-center gap-4">
                        <Users size={48} className="opacity-10" />
                        <p className="text-sm uppercase tracking-widest font-bold">No identities discovered in database.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminView;