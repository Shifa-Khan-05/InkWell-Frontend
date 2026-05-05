import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReaderView from '../pages/ReaderView';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';
import { toast } from 'react-toastify';

vi.mock('../api/axios');
vi.mock('react-toastify');

// Mock Razorpay
window.Razorpay = vi.fn().mockImplementation(() => ({
    open: vi.fn()
}));

const MockReaderView = (props) => (
    <BrowserRouter>
        <ReaderView {...props} />
    </BrowserRouter>
);

describe('ReaderView Page', () => {
    const mockPosts = [
        { postId: 1, title: 'My Story', likesCount: 5 }
    ];
    const mockProfile = {
        fullName: 'Reader User',
        subscriptionStartDate: '2026-01-01',
        subscriptionEndDate: '2027-01-01'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('userId', '123');
        localStorage.setItem('role', 'ROLE_READER');
        api.get.mockImplementation((url) => {
            if (url.includes('/posts/author/')) return Promise.resolve({ data: mockPosts });
            if (url.includes('/auth/profile/')) return Promise.resolve({ data: mockProfile });
            return Promise.reject(new Error('not found'));
        });
    });

    it('renders reader dashboard with stats', async () => {
        render(<MockReaderView />);
        expect(await screen.findByText('5')).toBeInTheDocument(); // Likes
        expect(screen.getByText('Identity')).toBeInTheDocument();
    });

    it('shows premium upgrade banner for readers', async () => {
        render(<MockReaderView />);
        expect(await screen.findByText(/Unlock Premium/i)).toBeInTheDocument();
        expect(screen.getByText(/Upgrade for ₹499/i)).toBeInTheDocument();
    });

    it('handles premium upgrade process', async () => {
        api.post.mockResolvedValueOnce({ data: { id: 'order_123', amount: 499, currency: 'INR' } });
        render(<MockReaderView />);
        
        const upgradeBtn = await screen.findByText(/Upgrade for ₹499/i);
        fireEvent.click(upgradeBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/payments/create-order', { amount: 499 });
            expect(window.Razorpay).toHaveBeenCalled();
        });
    });

    it('handles author role request', async () => {
        api.post.mockResolvedValueOnce({});
        render(<MockReaderView />);
        
        const requestBtn = await screen.findByText(/Request Writer Role/i);
        fireEvent.click(requestBtn);

        const sendBtn = await screen.findByText('Send Request');
        fireEvent.click(sendBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith(expect.stringContaining('/request-role?requestedRole=AUTHOR'));
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("sent to Admin"));
        });
    });

    it('shows membership details for PREMIUM role', async () => {
        localStorage.setItem('role', 'ROLE_PREMIUM');
        render(<MockReaderView />);
        expect(await screen.findByText('Pro Membership')).toBeInTheDocument();
        expect(screen.getByText('Next Billing Cycle')).toBeInTheDocument();
    });
});
