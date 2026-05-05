import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from "react-toastify";
import { X, Lock, Mail, User, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import usePageTitle from "../hooks/usePageTitle";

const Register = () => {
    usePageTitle('Register');
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'READER',
        otp: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        let temp = {};
        if (!formData.fullName.trim()) temp.fullName = "Full name is required";
        if (!formData.username.trim()) temp.username = "Username is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) temp.email = "Invalid email format";
        if (formData.password.length < 6) temp.password = "Minimum 6 characters";
        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await api.post('/auth/send-otp', { email: formData.email });
            toast.success("OTP sent to your email!");
            setOtpSent(true);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Failed to send OTP ❌";
            toast.error(typeof errorMsg === 'string' ? errorMsg : "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!formData.otp.trim()) {
            setErrors({ ...errors, otp: "OTP is required" });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success(`Registered successfully as ${formData.role.toLowerCase()}! 🎉`);
            
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Registration failed ❌";
            toast.error(typeof errorMsg === 'string' ? errorMsg : "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 font-sans selection:bg-primary/20 selection:text-primary relative overflow-hidden py-12 transition-colors duration-300">
            {/* Background elements */}
            <div className="absolute top-[-5%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl"
            >
                <button onClick={() => navigate('/')} className="absolute top-6 right-6 text-muted-foreground hover:text-primary bg-muted hover:bg-primary/10 p-2 rounded-full transition-all">
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-foreground rounded-2xl shadow-lg shadow-foreground/20 mb-6 group hover:bg-primary transition-colors duration-500">
                        <span className="text-background font-bold text-2xl font-serif">iw</span>
                    </div>
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">Join InkWell</h2>
                    <p className="text-muted-foreground mt-2 font-medium">Create your account to start writing</p>
                </div>

                <form onSubmit={otpSent ? handleRegister : handleSendOtp} className="space-y-4">
                    {/* Role Toggle */}
                    <div className="flex p-1.5 bg-muted rounded-2xl mb-6 shadow-inner">
                        <button type="button" onClick={() => setFormData({ ...formData, role: 'READER' })}
                            disabled={otpSent}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${formData.role === 'READER' ? 'bg-card text-primary shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'} ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            Reader
                        </button>
                        <button type="button" onClick={() => setFormData({ ...formData, role: 'AUTHOR' })}
                            disabled={otpSent}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${formData.role === 'AUTHOR' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'} ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            Author
                        </button>
                    </div>

                    <div className="space-y-1">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <input type="text" placeholder="Full Name" disabled={otpSent} className={`w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl text-foreground font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/40 placeholder:font-normal ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} value={formData.fullName} />
                        </div>
                        {errors.fullName && <p className="text-destructive text-xs pl-2 pt-1 font-medium">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-1">
                        <div className="relative group">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <input type="text" placeholder="Username" disabled={otpSent} className={`w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl text-foreground font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/40 placeholder:font-normal ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })} value={formData.username} />
                        </div>
                        {errors.username && <p className="text-destructive text-xs pl-2 pt-1 font-medium">{errors.username}</p>}
                    </div>

                    <div className="space-y-1">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <input type="email" placeholder="Email address" disabled={otpSent} className={`w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl text-foreground font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/40 placeholder:font-normal ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })} value={formData.email} />
                        </div>
                        {errors.email && <p className="text-destructive text-xs pl-2 pt-1 font-medium">{errors.email}</p>}
                    </div>

                    <div className="space-y-1 pb-2">
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                            <input type="password" placeholder="Password (min 6 chars)" disabled={otpSent} className={`w-full pl-12 pr-4 py-4 bg-muted border border-border rounded-2xl text-foreground font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-muted-foreground/40 placeholder:font-normal ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })} value={formData.password} />
                        </div>
                        {errors.password && <p className="text-destructive text-xs pl-2 pt-1 font-medium">{errors.password}</p>}
                    </div>

                    {otpSent && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1 pb-2">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary transition-colors" size={18} />
                                <input type="text" placeholder="Enter 6-digit OTP" className="w-full pl-12 pr-4 py-4 bg-background border-2 border-primary/50 rounded-2xl text-foreground font-bold outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/40 placeholder:font-normal text-center tracking-widest"
                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })} value={formData.otp} maxLength={6} />
                            </div>
                            {errors.otp && <p className="text-destructive text-xs pl-2 pt-1 font-medium">{errors.otp}</p>}
                            <p className="text-xs text-center text-muted-foreground mt-2">
                                Please check your email for the OTP.
                            </p>
                        </motion.div>
                    )}

                    <button type="submit" disabled={loading} className={`w-full py-4 rounded-2xl font-bold text-background transition-all duration-300 ${loading ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-foreground hover:bg-foreground/90 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"}`}>
                        {loading ? "Please wait..." : (otpSent ? "Verify & Register" : "Send Verification OTP")}
                    </button>
                    
                    <p className="text-center text-muted-foreground mt-6 text-sm font-medium">
                        Already have an account?{" "}
                        <Link to="/login" className="text-foreground font-bold hover:underline transition-colors hover:text-primary">Sign in</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;