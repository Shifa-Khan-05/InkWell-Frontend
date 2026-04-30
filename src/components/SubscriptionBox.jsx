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
        <div className="p-10 bg-card border border-border rounded-[2.5rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group duration-300">
            <div>
                <div className="bg-primary/10 p-5 rounded-3xl w-fit text-primary mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Mail size={32} />
                </div>
                <h3 className="text-3xl font-bold text-foreground tracking-tight">Stay Informed</h3>
                <p className="text-muted-foreground text-base mt-2 font-medium">Join our mailing list to receive the latest curated manuscripts and platform updates.</p>
            </div>
            
            <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3">
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="flex-1 bg-muted border border-border rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-foreground font-medium placeholder:text-muted-foreground/40"
                    required
                />
                <button type="submit" className="bg-foreground text-background px-6 py-4 rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95">
                    <Send size={18} /> Subscribe
                </button>
            </form>
        </div>
    );
};

export default SubscriptionBox;