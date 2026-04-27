// src/components/SubscriptionBox.jsx
import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const SubscriptionBox = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        try {
            await api.post('/newsletter/subscribe', { email });
            toast.success("Joined the narrative inner circle! 📧");
            setEmail('');
        } catch (err) {
            toast.error("Subscription currently unavailable.");
        }
    };

    return (
        <div className="p-10 bg-white border border-stone-200 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
                <div className="bg-amber-50 p-5 rounded-3xl w-fit text-amber-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Mail size={32} />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Stay Informed</h3>
                <p className="text-slate-500 text-base mt-2 font-medium">Join our mailing list to receive the latest curated manuscripts and platform updates.</p>
            </div>
            
            <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3">
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-slate-900 font-medium placeholder:text-stone-400"
                    required
                />
                <button type="submit" className="bg-slate-900 text-white px-6 py-4 rounded-2xl hover:bg-amber-600 transition-all font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                    <Send size={18} /> Subscribe
                </button>
            </form>
        </div>
    );
};

export default SubscriptionBox;