import React, { useState, useEffect } from 'react';
import { Send, Users, Mail, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const NewsletterManager = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [broadcast, setBroadcast] = useState({ subject: '', body: '', email: '' });
    const [isTargeted, setIsTargeted] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            const res = await api.get('/newsletter/all');
            setSubscribers(res.data || []);
        } catch (err) {
            console.error("Failed to load audience");
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        
        if (isTargeted) {
            if (!broadcast.email) {
                toast.error("Please provide a recipient email.");
                return;
            }
            try {
                await api.post('/newsletter/direct-mail', { 
                    email: broadcast.email, 
                    subject: broadcast.subject, 
                    title: "Direct Notification", 
                    body: broadcast.body 
                });
                toast.success(`Sent directly to ${broadcast.email}! 🚀`);
                setBroadcast({ subject: '', body: '', email: '' });
            } catch (err) {
                toast.error("Failed to send direct email.");
            }
        } else {
            if (subscribers.length === 0) {
                toast.error("No readers in your audience list!");
                return;
            }
            try {
                await api.post('/newsletter/broadcast', {
                    subject: broadcast.subject,
                    body: broadcast.body
                });
                toast.success(`Broadcast sent to ${subscribers.length} narratives! 🚀`);
                setBroadcast({ subject: '', body: '', email: '' });
            } catch (err) {
                toast.error("Broadcast failed.");
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* LEFT: Sending Panel */}
            <div className="bg-white p-10 rounded-[3rem] border border-stone-200 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-900">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><Send size={24}/></div> {isTargeted ? 'Targeted Email' : 'Broadcast Dispatch'}
                    </h2>
                    <button 
                        onClick={() => setIsTargeted(!isTargeted)}
                        className="text-sm font-bold text-slate-500 hover:text-amber-600 px-4 py-2 border border-stone-200 rounded-xl transition-colors bg-stone-50"
                    >
                        Switch to {isTargeted ? 'Broadcast' : 'Targeted User'}
                    </button>
                </div>

                <form onSubmit={handleSend} className="space-y-5">
                    {isTargeted && (
                        <input 
                            type="email"
                            className="w-full bg-stone-50 border border-stone-200 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold text-slate-900 shadow-sm placeholder:text-stone-400"
                            placeholder="Recipient Email Address"
                            value={broadcast.email}
                            onChange={(e) => setBroadcast({...broadcast, email: e.target.value})}
                            required
                        />
                    )}
                    <input 
                        className="w-full bg-stone-50 border border-stone-200 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-bold text-slate-900 shadow-sm placeholder:text-stone-400 placeholder:font-medium"
                        placeholder="Subject Line"
                        value={broadcast.subject}
                        onChange={(e) => setBroadcast({...broadcast, subject: e.target.value})}
                        required
                    />
                    <textarea 
                        className="w-full bg-stone-50 border border-stone-200 p-5 rounded-3xl h-64 resize-none outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-slate-700 shadow-sm placeholder:text-stone-400 placeholder:font-medium text-lg leading-relaxed"
                        placeholder="Write your story here..."
                        value={broadcast.body}
                        onChange={(e) => setBroadcast({...broadcast, body: e.target.value})}
                        required
                    />
                    <button className="w-full bg-slate-900 py-6 rounded-2xl font-bold uppercase text-white tracking-widest hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
                        {isTargeted ? 'Send to Single User' : `Broadcast to ${subscribers.length} Readers`}
                    </button>
                </form>
            </div>

            {/* RIGHT: Subscriber List */}
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-900">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Users size={24}/></div> Verified Audience
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {subscribers.length > 0 ? (
                        subscribers.map(sub => (
                            <div key={sub.id} className="bg-white border border-stone-100 shadow-sm p-5 rounded-2xl flex justify-between items-center group hover:border-emerald-200 transition-all hover:shadow-md cursor-pointer" onClick={() => { setIsTargeted(true); setBroadcast({...broadcast, email: sub.email}); }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                        <Mail size={20} />
                                    </div>
                                    <span className="font-bold text-slate-700">{sub.email}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Joined {new Date(sub.subscribedAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-stone-200 bg-stone-50 rounded-[2.5rem] text-slate-400 font-medium tracking-wide">
                            No readers have joined your newsletter yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsletterManager;