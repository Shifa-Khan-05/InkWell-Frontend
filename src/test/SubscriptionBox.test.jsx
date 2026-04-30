import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import SubscriptionBox from '../components/SubscriptionBox';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';
import { toast } from 'react-toastify';

vi.mock('../api/axios');
vi.mock('react-toastify');

const MockSubscriptionBox = () => (
    <BrowserRouter>
        <ThemeProvider>
            <SubscriptionBox />
        </ThemeProvider>
    </BrowserRouter>
);

describe('SubscriptionBox Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<MockSubscriptionBox />);
        expect(screen.getByText(/Stay Informed/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/name@domain.com/i)).toBeInTheDocument();
        expect(screen.getByText(/Subscribe/i)).toBeInTheDocument();
    });

    it('handles successful subscription', async () => {
        api.post.mockResolvedValueOnce({ data: {} });
        render(<MockSubscriptionBox />);
        
        const input = screen.getByPlaceholderText(/name@domain.com/i);
        const submitBtn = screen.getByText(/Subscribe/i);

        fireEvent.change(input, { target: { value: 'reader@inkwell.com' } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/newsletter/subscribe', { email: 'reader@inkwell.com' });
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Joined the narrative inner circle"));
        });
        
        // Input should be cleared
        expect(input.value).toBe('');
    });

    it('handles failed subscription', async () => {
        api.post.mockRejectedValueOnce(new Error('Failed'));
        render(<MockSubscriptionBox />);
        
        fireEvent.change(screen.getByPlaceholderText(/name@domain.com/i), { target: { value: 'reader@inkwell.com' } });
        fireEvent.click(screen.getByText(/Subscribe/i));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Subscription currently unavailable.");
        });
    });
});
