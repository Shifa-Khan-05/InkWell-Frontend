import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import usePageTitle from '../hooks/usePageTitle';

const ResetPassword = () => {
    usePageTitle('Reset Password');
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword: password });
            toast.success("Security protocols updated! You may now login. ✨");
            navigate('/login');
        } catch (err) {
            toast.error("Security token invalid or expired.");
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
                className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl text-center relative z-10"
            >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-sm">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">Refine Credentials</h1>
                <p className="text-muted-foreground font-medium leading-relaxed mb-10">
                    Set a strong new password for your InkWell identity.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="password" 
                            required
                            placeholder="New Password"
                            className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground/40"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="password" 
                            required
                            placeholder="Confirm New Password"
                            className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground/40"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-foreground text-background py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-foreground/90 transition-all shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Updating..." : <><ArrowRight size={18} /> Update Password</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;