import React, { useState, useEffect } from 'react';
import { Send, Users, Mail, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const NewsletterManager = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [broadcast, setBroadcast] = useState({ subject: '', body: '' });

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

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if(subscribers.length === 0) {
            toast.error("No readers in your audience list!");
            return;
        }
        try {
            await api.post('/newsletter/broadcast', broadcast);
            toast.success(`Broadcast sent to ${subscribers.length} narratives! 🚀`);
            setBroadcast({ subject: '', body: '' });
        } catch (err) {
            toast.error("Broadcast failed.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* LEFT: Sending Panel */}
            <div className="bg-gray-900/20 p-10 rounded-[45px] border border-gray-800 space-y-8">
                <h2 className="text-2xl font-black italic uppercase flex items-center gap-3">
                    <Send className="text-blue-500" /> Dispatch Narrative
                </h2>
                <form onSubmit={handleBroadcast} className="space-y-4">
                    <input 
                        className="w-full bg-black border border-gray-800 p-5 rounded-2xl outline-none focus:border-blue-500 transition font-bold"
                        placeholder="SUBJECT LINE"
                        value={broadcast.subject}
                        onChange={(e) => setBroadcast({...broadcast, subject: e.target.value})}
                        required
                    />
                    <textarea 
                        className="w-full bg-black border border-gray-800 p-5 rounded-2xl h-64 resize-none outline-none focus:border-blue-500 transition"
                        placeholder="WRITE YOUR STORY HERE..."
                        value={broadcast.body}
                        onChange={(e) => setBroadcast({...broadcast, body: e.target.value})}
                        required
                    />
                    <button className="w-full bg-blue-600 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-600/20">
                        BROADCAST TO {subscribers.length} READERS
                    </button>
                </form>
            </div>

            {/* RIGHT: Subscriber List (Who is receiving the mail?) */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black italic uppercase flex items-center gap-3">
                    <Users className="text-green-500" /> Verified Audience
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {subscribers.length > 0 ? (
                        subscribers.map(sub => (
                            <div key={sub.id} className="bg-gray-900/40 border border-gray-800 p-5 rounded-3xl flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                        <Mail size={18} />
                                    </div>
                                    <span className="font-bold text-gray-200">{sub.email}</span>
                                </div>
                                <span className="text-[10px] font-mono text-gray-600 uppercase">
                                    Joined {new Date(sub.subscribedAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-gray-900 rounded-[40px] text-gray-700 italic">
                            No readers have joined your newsletter yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsletterManager;