import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import usePageTitle from '../hooks/usePageTitle';

const ForgotPassword = () => {
    usePageTitle('Forgot Password');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success("Recovery manuscript dispatched to your inbox! 📩");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Identity verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans relative overflow-hidden selection:bg-primary/20 selection:text-primary transition-colors duration-300">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-sm">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">Recover Access</h1>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                        Enter your email and we'll transmit a secure link to reset your credentials.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="email" 
                            required
                            placeholder="Email Address"
                            className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground/40"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-foreground text-background py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-foreground/90 transition-all shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {loading ? "Transmitting..." : <><Send size={18} /> Send Reset Link</>}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-border text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground font-bold hover:text-foreground transition-colors">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;