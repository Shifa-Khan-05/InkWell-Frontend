import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import Login from '../pages/Login';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';
import { toast } from 'react-toastify';

vi.mock('../api/axios');
vi.mock('react-toastify');

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

const MockLogin = () => (
    <BrowserRouter>
        <ThemeProvider>
            <Login />
        </ThemeProvider>
    </BrowserRouter>
);

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders login form and google button', () => {
        render(<MockLogin />);
        expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
        expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    });

    it('handles successful login', async () => {
        const mockResponse = {
            data: {
                token: 'fake-token',
                role: 'ROLE_AUTHOR',
                userId: '123'
            }
        };
        api.post.mockResolvedValueOnce(mockResponse);
        render(<MockLogin />);
        
        fireEvent.change(screen.getByPlaceholderText(/Email address/i), { target: { value: 'test@inkwell.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByText(/Sign In to InkWell/i));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/login', {
                email: 'test@inkwell.com',
                password: 'password123'
            });
            expect(localStorage.getItem('token')).toBe('fake-token');
            expect(localStorage.getItem('role')).toBe('AUTHOR');
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Identity Verified"));
        });
    });

    it('handles login failure', async () => {
        api.post.mockRejectedValueOnce(new Error('Unauthorized'));
        render(<MockLogin />);
        
        fireEvent.click(screen.getByText(/Sign In to InkWell/i));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("verification failed"));
        });
    });

    it('toggles password visibility', () => {
        render(<MockLogin />);
        const passwordInput = screen.getByPlaceholderText(/Password/i);
        const toggleBtn = screen.getByRole('button', { name: '' }); // The eye button has no text, so we might need a better query or label

        expect(passwordInput.type).toBe('password');
        
        // Find by icon/button container - the eye icon is inside a button
        const eyeButton = screen.getByPlaceholderText(/Password/i).parentElement.querySelector('button');
        fireEvent.click(eyeButton);
        expect(passwordInput.type).toBe('text');
        
        fireEvent.click(eyeButton);
        expect(passwordInput.type).toBe('password');
    });
});
