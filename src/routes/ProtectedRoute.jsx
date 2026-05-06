import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) {
    // Not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if route requires specific roles
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = [role || 'READER']; // Fallback
    
    // We stored role as uppercase without ROLE_ prefix in Login.jsx. 
    // Ensure allowedRoles matches this format or map it.
    const mappedAllowedRoles = allowedRoles.map(r => r.replace('ROLE_', '').toUpperCase());
    const hasRequiredRole = mappedAllowedRoles.some(r => userRoles.includes(r));
    
    if (!hasRequiredRole) {
      // Logged in but insufficient permissions, redirect to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;
