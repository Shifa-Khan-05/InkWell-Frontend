import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from "react-toastify";
import { X } from "lucide-react";

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'READER' 
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            // Requirement 4.1: Role field is sent to backend
            await api.post('/auth/register', formData);
            toast.success(`Registered successfully as ${formData.role.toLowerCase()}! 🎉`);
            
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data || "Registration failed ❌";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
                <button onClick={() => navigate('/')} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
                    <X size={22} />
                </button>

                <h2 className="text-3xl font-bold text-white text-center mb-2 italic">InkWell</h2>
                <p className="text-center text-gray-400 mb-8">Create your account</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Role Toggle */}
                    <div className="flex p-1 bg-black border border-gray-700 rounded-lg">
                        <button type="button" onClick={() => setFormData({ ...formData, role: 'READER' })}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${formData.role === 'READER' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>
                            Reader
                        </button>
                        <button type="button" onClick={() => setFormData({ ...formData, role: 'AUTHOR' })}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${formData.role === 'AUTHOR' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>
                            Author
                        </button>
                    </div>

                    <input type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-600"
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                    {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}

                    <input type="text" placeholder="Username" className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-600"
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                    {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}

                    <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-600"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

                    <input type="password" placeholder="Password" className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-600"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

                    <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-semibold text-white transition ${loading ? "bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;