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

    if (loading) return <div className="p-10 text-center animate-pulse text-blue-500 font-mono">SCANNING DISCUSSIONS...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-black italic mb-8">Pending Feedback</h2>
            {pending.length > 0 ? pending.map(comment => (
                <div key={comment.commentId} className="bg-gray-900 border border-gray-800 p-6 rounded-[30px] flex justify-between items-center group">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                            <User size={12}/> {comment.authorName} <Clock size={12} className="ml-2"/> {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                        <p className="text-gray-300 italic">"{comment.content}"</p>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleAction(comment.commentId, 'approve')} className="p-3 bg-green-500/10 text-green-500 rounded-2xl hover:bg-green-500 hover:text-white transition"><Check size={20}/></button>
                        <button onClick={() => handleAction(comment.commentId, 'reject')} className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition"><X size={20}/></button>
                    </div>
                </div>
            )) : <div className="py-20 text-center text-gray-600 italic">No discussions awaiting review.</div>}
        </div>
    );
};

export default ModerationQueue;