import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId'); // ✅ Matches backend queryParam
    const role = params.get('role');

    if (token && userId) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('role', role);
        // Navigate away from the URL with sensitive tokens
        navigate('/dashboard', { replace: true }); 
    } else {
        console.error("Missing Data:", { token, userId });
        navigate('/login');
    }
}, [location, navigate]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-blue-500 font-black uppercase tracking-widest text-sm">
                Syncing Identity...
            </div>
        </div>
    );
};

export default OAuthSuccess;