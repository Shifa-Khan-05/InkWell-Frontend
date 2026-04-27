import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from "react-toastify";
import { X, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
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
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 font-sans selection:bg-rose-200 selection:text-rose-900 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-amber-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md bg-white border border-stone-100 rounded-[2.5rem] p-10 shadow-2xl shadow-stone-200/50"
            >
                {/* Close Button */}
                <button 
                    onClick={() => navigate('/')} 
                    className="absolute top-6 right-6 text-stone-400 hover:text-rose-600 bg-stone-50 hover:bg-rose-50 p-2 rounded-full transition-all"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl shadow-lg shadow-slate-900/20 mb-6 group hover:bg-rose-600 transition-colors duration-500">
                        <span className="text-white font-bold text-2xl font-serif">iw</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Rejoin the narrative journey</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                        <input 
                            type="email" 
                            required 
                            placeholder="Email address" 
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all placeholder:text-stone-400 placeholder:font-normal"
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} 
                        />
                    </div>
                    
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-rose-500 transition-colors" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            required 
                            placeholder="Password" 
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-4 pl-12 pr-12 text-slate-900 font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all placeholder:text-stone-400 placeholder:font-normal"
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-600 transition-all"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="flex justify-end px-1">
                        <Link 
                            to="/forgot-password" 
                            className="text-sm font-bold text-slate-400 hover:text-rose-600 transition-colors"
                        >
                            Forgot Credentials?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className={`w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 ${
                            loading ? "bg-stone-300 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                        }`}
                    >
                        {loading ? "Verifying Identity..." : "Sign In to InkWell"}
                    </button>
                </form>

                {/* OAuth2 Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-100"></span></div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-xs font-semibold uppercase tracking-widest text-stone-400">Or integrate with</span>
                    </div>
                </div>

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3.5 border border-stone-200 rounded-2xl text-slate-700 font-bold flex items-center justify-center space-x-3 hover:bg-stone-50 hover:border-stone-300 transition-all active:scale-95 shadow-sm group"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5 group-hover:scale-110 transition-transform"
                    />
                    <span>Continue with Google</span>
                </button>
                
                <p className="text-center text-slate-500 mt-8 text-sm font-medium">
                    New to the circle?{" "}
                    <Link to="/register" className="text-rose-600 font-bold hover:text-rose-700 transition-colors">Apply for Membership</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;