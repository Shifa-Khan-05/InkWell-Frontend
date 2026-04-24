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
        <div className="p-10 bg-gray-900/40 border border-gray-800 rounded-[45px] shadow-2xl flex flex-col justify-between">
            <div>
                <div className="bg-orange-500/10 p-5 rounded-3xl w-fit text-orange-500 mb-6">
                    <Mail size={32} />
                </div>
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Join the Newsletter</h3>
                <p className="text-gray-500 text-sm font-medium mt-2">Get fresh manuscripts delivered directly to your inbox.</p>
            </div>
            
            <form onSubmit={handleSubscribe} className="mt-8 flex gap-2">
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email..."
                    className="flex-1 bg-black border border-gray-800 rounded-2xl px-5 py-4 outline-none focus:border-orange-500 transition-all text-sm font-bold"
                    required
                />
                <button type="submit" className="bg-orange-600 p-4 rounded-2xl hover:bg-orange-700 transition shadow-lg shadow-orange-600/20">
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default SubscriptionBox;