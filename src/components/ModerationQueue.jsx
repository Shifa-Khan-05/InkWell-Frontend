import React, { useState, useEffect } from 'react';
import { Check, X, MessageSquare, Clock, User } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ModerationQueue = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchPending(); }, []);

    const fetchPending = async () => {
        try {
            const res = await api.get('/comments/pending');
            setPending(res.data);
        } catch (err) { toast.error("Failed to load queue."); }
        finally { setLoading(false); }
    };

    const handleAction = async (id, action) => {
        try {
            await api.put(`/comments/${id}/${action}`);
            toast.success(`Comment ${action}ed!`);
            setPending(prev => prev.filter(c => c.commentId !== id));
        } catch (err) { toast.error("Moderation failed."); }
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium tracking-wide">Scanning Discussions...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-900">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600"><MessageSquare size={24} /></div> Pending Feedback
                </h2>
            </div>
            {pending.length > 0 ? pending.map(comment => (
                <div key={comment.commentId} className="bg-white border border-stone-200 p-6 rounded-[2rem] shadow-sm flex justify-between items-center group hover:border-amber-200 transition-all hover:shadow-md">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                            <span className="flex items-center bg-amber-50 px-2 py-1 rounded-md"><User size={12} className="mr-1"/> {comment.authorName}</span> 
                            <span className="flex items-center text-slate-400"><Clock size={12} className="mr-1"/> {new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 font-serif text-lg italic leading-relaxed">"{comment.content}"</p>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleAction(comment.commentId, 'approve')} className="p-3 bg-white border border-stone-200 text-slate-400 rounded-xl hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm"><Check size={20}/></button>
                        <button onClick={() => handleAction(comment.commentId, 'reject')} className="p-3 bg-white border border-stone-200 text-slate-400 rounded-xl hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"><X size={20}/></button>
                    </div>
                </div>
            )) : <div className="py-20 text-center border-2 border-dashed border-stone-200 bg-stone-50 rounded-[2.5rem] text-slate-400 font-medium tracking-wide">No discussions awaiting review.</div>}
        </div>
    );
};

export default ModerationQueue;