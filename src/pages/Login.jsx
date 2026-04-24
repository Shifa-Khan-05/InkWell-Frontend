import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from "react-toastify";
import { X } from "lucide-react";

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/login', credentials);
            
            // Extract the dynamic userId (13, 14, etc.)
            const { token, role, userId } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId); // ✅ Store dynamic ID
            localStorage.setItem('role', role.replace('ROLE_', '').toUpperCase());

            toast.success("Login successful 🎉");
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (error) {
            toast.error("Login failed ❌");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Direct browser redirect to bypass CORS for OAuth2 handshake
        window.location.href = "http://localhost:8081/oauth2/authorization/google";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
                
                {/* Close Button */}
                <button 
                    onClick={() => navigate('/')} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <X size={22} />
                </button>

                <h2 className="text-3xl font-bold text-center text-white mb-2 italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    InkWell
                </h2>
                <p className="text-center text-gray-400 mb-8 font-medium">Sign in to your account</p>

                <form onSubmit={handleLogin} className="space-y-5">
                    <input 
                        type="email" 
                        required 
                        placeholder="Email" 
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-600 outline-none transition"
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} 
                    />
                    
                    <input 
                        type="password" 
                        required 
                        placeholder="Password" 
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-600 outline-none transition"
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} 
                    />

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className={`w-full py-3 rounded-lg font-bold text-white transition ${
                            loading ? "bg-gray-700 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 active:scale-95 shadow-lg"
                        }`}
                    >
                        {loading ? "Verifying..." : "Login"}
                    </button>
                </form>

                {/* OAuth2 Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800"></span></div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-gray-900 px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3 border border-gray-700 rounded-lg text-white flex items-center justify-center space-x-3 hover:bg-gray-800 transition active:scale-95"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    <span className="font-medium">Sign in with Google</span>
                </button>
                
                <p className="text-center text-gray-400 mt-8 text-sm">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-500 font-bold hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;