import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import Dashboard from '../pages/Dashboard';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';

// Mocking dependencies
vi.mock('../api/axios');
vi.mock('../components/NotificationBell', () => ({ default: () => <div data-testid="notification-bell">Bell</div> }));
vi.mock('../components/TaxonomyManager', () => ({ default: () => <div>Taxonomy Manager</div> }));
vi.mock('./AuthorView', () => ({ default: () => <div>Author View</div> }));
vi.mock('./AdminView', () => ({ default: () => <div>Admin View</div> }));
vi.mock('./ReaderView', () => ({ default: () => <div>Reader View</div> }));
vi.mock('../components/ModerationQueue', () => ({ default: () => <div>Moderation Queue</div> }));
vi.mock('../components/GlobalPostManager', () => ({ default: () => <div>Global Post Manager</div> }));
vi.mock('../components/MediaLibrary', () => ({ default: () => <div>Media Library</div> }));
vi.mock('./NewsletterManager', () => ({ default: () => <div>Newsletter Manager</div> }));
vi.mock('../components/SavedPosts', () => ({ default: () => <div>Saved Posts</div> }));

const MockDashboard = () => (
    <BrowserRouter>
        <ThemeProvider>
            <Dashboard />
        </ThemeProvider>
    </BrowserRouter>
);

describe('Dashboard Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('userId', '123');
        localStorage.setItem('role', 'READER');
    });

    it('renders loader initially and then content', async () => {
        api.get.mockResolvedValueOnce({ data: { fullName: 'Test User' } });
        render(<MockDashboard />);
        
        expect(screen.getByText(/Loading workspace.../i)).toBeInTheDocument();
        
        expect(await screen.findByText(/Test User/i)).toBeInTheDocument();
    });

    it('shows limited options for READER role', async () => {
        localStorage.setItem('role', 'READER');
        api.get.mockResolvedValueOnce({ data: { fullName: 'Reader User' } });
        render(<MockDashboard />);

        expect(await screen.findByText(/Reader User/i)).toBeInTheDocument();

        expect(screen.queryByText(/System Admin/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/My Content/i)).not.toBeInTheDocument();
    });

    it('shows ADMIN options for ADMIN role', async () => {
        localStorage.setItem('role', 'ADMIN');
        api.get.mockResolvedValueOnce({ data: { fullName: 'Admin User' } });
        render(<MockDashboard />);

        expect(await screen.findByText(/System Admin/i)).toBeInTheDocument();
        expect(await screen.findByText(/Identity Control/i)).toBeInTheDocument();
    });

    it('switches tabs correctly', async () => {
        localStorage.setItem('role', 'ADMIN');
        api.get.mockResolvedValueOnce({ data: { fullName: 'Admin User' } });
        render(<MockDashboard />);

        const taxonomyBtn = await screen.findByText(/Taxonomy Center/i);
        fireEvent.click(taxonomyBtn);

        expect(await screen.findByText(/Taxonomy Manager/i)).toBeInTheDocument();
    });

    it('handles logout', async () => {
        api.get.mockResolvedValueOnce({ data: { fullName: 'Admin User' } });
        render(<MockDashboard />);

        const logoutBtn = await screen.findByText(/Logout/i);
        fireEvent.click(logoutBtn);

        expect(localStorage.getItem('token')).toBeNull();
    });
});
