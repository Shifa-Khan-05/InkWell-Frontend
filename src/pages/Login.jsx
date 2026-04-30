import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from "react-toastify";
import { X, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import usePageTitle from "../hooks/usePageTitle";

const Login = () => {
    usePageTitle('Login');
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/login', credentials);
            const { token, role, userId } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId); 
            localStorage.setItem('role', role.replace('ROLE_', '').toUpperCase());

            toast.success("Identity Verified. Welcome back! 🎉");
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (error) {
            toast.error("Credential verification failed ❌");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:8081/oauth2/authorization/google";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 font-sans selection:bg-primary/20 selection:text-primary relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl"
            >
                <button 
                    onClick={() => navigate('/')} 
                    className="absolute top-6 right-6 text-muted-foreground hover:text-primary bg-muted hover:bg-primary/10 p-2 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-foreground rounded-2xl shadow-lg shadow-foreground/20 mb-6 group hover:bg-primary transition-colors duration-500">
                        <span className="text-background font-bold text-2xl font-serif">iw</span>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Welcome Back</h2>
                    <p className="text-muted-foreground mt-2 font-medium">Rejoin the narrative journey</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                            type="email" 
                            required 
                            placeholder="Email address" 
                            className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 placeholder:font-normal"
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} 
                        />
                    </div>
                    
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            required 
                            placeholder="Password" 
                            className="w-full bg-muted border border-border rounded-2xl py-4 pl-12 pr-12 text-foreground font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/40 placeholder:font-normal"
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-all"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="flex justify-end px-1">
                        <Link to="/forgot-password" title="Forgot Credentials?" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                            Forgot Credentials?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className={`w-full py-4 rounded-2xl font-bold text-background transition-all duration-300 ${
                            loading ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-foreground hover:bg-foreground/90 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                        }`}
                    >
                        {loading ? "Verifying Identity..." : "Sign In to InkWell"}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
                    <div className="relative flex justify-center">
                        <span className="bg-card px-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Or integrate with</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3.5 border border-border rounded-2xl text-foreground font-bold flex items-center justify-center space-x-3 hover:bg-muted hover:border-primary/30 transition-all active:scale-95 shadow-sm group"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Continue with Google</span>
                </button>
                
                <p className="text-center text-muted-foreground mt-8 text-sm font-medium">
                    New to the circle? <Link to="/register" className="text-primary font-bold hover:text-primary/80 transition-colors">Apply for Membership</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;