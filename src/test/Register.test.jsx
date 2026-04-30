import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import Register from '../pages/Register';
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

const MockRegister = () => (
    <BrowserRouter>
        <ThemeProvider>
            <Register />
        </ThemeProvider>
    </BrowserRouter>
);

describe('Register Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders register form correctly', () => {
        render(<MockRegister />);
        expect(screen.getByText(/Join InkWell/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    });

    it('switches between Reader and Author roles', () => {
        render(<MockRegister />);
        const readerBtn = screen.getByText(/Reader/i);
        const authorBtn = screen.getByText(/Author/i);

        // Author button click
        fireEvent.click(authorBtn);
        expect(authorBtn).toHaveClass('text-foreground');
        
        // Reader button click
        fireEvent.click(readerBtn);
        expect(readerBtn).toHaveClass('text-primary');
    });

    it('shows validation errors for empty fields', () => {
        render(<MockRegister />);
        fireEvent.click(screen.getByText(/Create Account/i));

        expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
        expect(screen.getByText(/Minimum 6 characters/i)).toBeInTheDocument();
    });

    it('successfully registers a user', async () => {
        api.post.mockResolvedValueOnce({ data: {} });
        render(<MockRegister />);
        
        fireEvent.change(screen.getByPlaceholderText(/Full Name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'johndoe' } });
        fireEvent.change(screen.getByPlaceholderText(/Email address/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
        
        fireEvent.click(screen.getByText(/Create Account/i));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
                fullName: 'John Doe',
                email: 'john@example.com',
                role: 'READER'
            }));
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Registered successfully"));
        });
    });
});
