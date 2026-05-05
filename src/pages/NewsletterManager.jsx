import React, { useState, useEffect } from 'react';
import { Send, Users, Mail } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import usePageTitle from '../hooks/usePageTitle';

const NewsletterManager = () => {
    usePageTitle('Newsletter');
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 transition-colors duration-300">
            {/* LEFT: Sending Panel */}
            <div className="bg-card p-10 rounded-[3rem] border border-border shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-foreground">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Send size={24}/></div> {isTargeted ? 'Targeted Email' : 'Broadcast Dispatch'}
                    </h2>
                    <button 
                        onClick={() => setIsTargeted(!isTargeted)}
                        className="text-sm font-bold text-muted-foreground hover:text-primary px-4 py-2 border border-border rounded-xl transition-colors bg-muted"
                    >
                        Switch to {isTargeted ? 'Broadcast' : 'Targeted User'}
                    </button>
                </div>

                <form onSubmit={handleSend} className="space-y-5">
                    {isTargeted && (
                        <input 
                            type="email"
                            aria-label="Recipient Email"
                            className="w-full bg-muted border border-border p-5 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-foreground shadow-sm placeholder:text-muted-foreground/40"
                            placeholder="Recipient Email Address"
                            value={broadcast.email}
                            onChange={(e) => setBroadcast({...broadcast, email: e.target.value})}
                            required
                        />
                    )}
                    <input 
                        aria-label="Subject"
                        className="w-full bg-muted border border-border p-5 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-foreground shadow-sm placeholder:text-muted-foreground/40 placeholder:font-medium"
                        placeholder="Subject Line"
                        value={broadcast.subject}
                        onChange={(e) => setBroadcast({...broadcast, subject: e.target.value})}
                        required
                    />
                    <textarea 
                        aria-label="Email Body"
                        className="w-full bg-muted border border-border p-5 rounded-3xl h-64 resize-none outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground/80 shadow-sm placeholder:text-muted-foreground/40 placeholder:font-medium text-lg leading-relaxed"
                        placeholder="Write your story here..."
                        value={broadcast.body}
                        onChange={(e) => setBroadcast({...broadcast, body: e.target.value})}
                        required
                    />
                    <button className="w-full bg-foreground py-6 rounded-2xl font-bold uppercase text-background tracking-widest hover:bg-foreground/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
                        {isTargeted ? 'Send to Single User' : `Broadcast to ${subscribers.length} Readers`}
                    </button>
                </form>
            </div>

            {/* RIGHT: Subscriber List */}
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-foreground">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><Users size={24}/></div> Verified Audience
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {subscribers.length > 0 ? (
                        subscribers.map(sub => (
                            <div key={sub.id} className="bg-card border border-border shadow-sm p-5 rounded-2xl flex justify-between items-center group hover:border-emerald-500/30 transition-all hover:shadow-md cursor-pointer" onClick={() => { setIsTargeted(true); setBroadcast({...broadcast, email: sub.email}); }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                        <Mail size={20} />
                                    </div>
                                    <span className="font-bold text-foreground/80">{sub.email}</span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    Joined {new Date(sub.subscribedAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-border bg-muted/30 rounded-[2.5rem] text-muted-foreground font-medium tracking-wide">
                            No readers have joined your newsletter yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsletterManager;