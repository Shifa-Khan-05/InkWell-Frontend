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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-6 transition-colors duration-300">
            <div className="w-14 h-14 border-4 border-muted border-t-primary rounded-full animate-spin shadow-lg"></div>
            <div className="text-primary font-bold uppercase tracking-[0.3em] text-xs">
                Synchronizing Identity
            </div>
            <p className="text-muted-foreground/60 text-[10px] uppercase font-medium animate-pulse">
                establishing secure connection...
            </p>
        </div>
    );
};

export default OAuthSuccess;