import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Lazy loaded components for code splitting
const Home = lazy(() => import('../pages/Home'));
const Browse = lazy(() => import('../pages/Browse'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const OAuthSuccess = lazy(() => import('../pages/OAuthSuccess'));
const PostDetails = lazy(() => import('../pages/PostDetails'));
const ProfileView = lazy(() => import('../pages/ProfileView'));
const NewsletterManager = lazy(() => import('../pages/NewsletterManager'));

// Components
const TaxonomyManager = lazy(() => import('../components/TaxonomyManager'));
const MediaLibrary = lazy(() => import('../components/MediaLibrary'));
const ForgotPassword = lazy(() => import('../components/ForgotPassword'));
const ResetPassword = lazy(() => import('../components/ResetPassword'));

const SuspenseFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/post/:slug" element={<PostDetails />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes (Any authenticated user) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileView />
          </ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute>
            <ProfileView />
          </ProtectedRoute>
        } />
        <Route path="/profile-view" element={
          <ProtectedRoute>
            <ProfileView />
          </ProtectedRoute>
        } />

        {/* Protected Routes (Role based) */}
        <Route path="/media-library" element={
          <ProtectedRoute allowedRoles={['ROLE_AUTHOR', 'ROLE_ADMIN']}>
            <MediaLibrary />
          </ProtectedRoute>
        } />
        <Route path="/taxonomy-manager" element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_AUTHOR', 'ROLE_PREMIUM']}>
            <TaxonomyManager />
          </ProtectedRoute>
        } />
        <Route path="/newsletter-manager" element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <NewsletterManager />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
