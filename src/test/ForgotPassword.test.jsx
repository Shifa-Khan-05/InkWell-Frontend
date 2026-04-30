import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import ForgotPassword from '../components/ForgotPassword';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';
import { toast } from 'react-toastify';

vi.mock('../api/axios');
vi.mock('react-toastify');

// Mocking framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

const MockForgotPassword = () => (
    <BrowserRouter>
        <ThemeProvider>
            <ForgotPassword />
        </ThemeProvider>
    </BrowserRouter>
);

describe('ForgotPassword Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the recover access form', () => {
        render(<MockForgotPassword />);
        expect(screen.getByText(/Recover Access/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByText(/Send Reset Link/i)).toBeInTheDocument();
    });

    it('submits the form successfully', async () => {
        api.post.mockResolvedValueOnce({ data: {} });
        render(<MockForgotPassword />);
        
        const input = screen.getByPlaceholderText(/Email Address/i);
        const submitBtn = screen.getByText(/Send Reset Link/i);

        fireEvent.change(input, { target: { value: 'user@example.com' } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'user@example.com' });
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Recovery manuscript dispatched"));
        });
    });

    it('shows loading state during submission', async () => {
        api.post.mockReturnValue(new Promise(resolve => setTimeout(resolve, 100)));
        render(<MockForgotPassword />);
        
        fireEvent.change(screen.getByPlaceholderText(/Email Address/i), { target: { value: 'user@example.com' } });
        fireEvent.click(screen.getByText(/Send Reset Link/i));

        expect(screen.getByText(/Transmitting.../i)).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
