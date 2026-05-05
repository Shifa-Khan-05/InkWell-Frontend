import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import Footer from '../components/Footer';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';
import { toast } from 'react-toastify';

vi.mock('../api/axios');
vi.mock('react-toastify');

const MockFooter = () => (
    <BrowserRouter>
        <ThemeProvider>
            <Footer />
        </ThemeProvider>
    </BrowserRouter>
);

describe('Footer Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders branding and links', () => {
        render(<MockFooter />);
        // Use getAllByText to handle potential multiple InkWell matches or be more specific
        const brandingElements = screen.getAllByText(/InkWell/i);
        expect(brandingElements.length).toBeGreaterThan(0);
        
        expect(screen.getByText(/Published Works/i)).toBeInTheDocument();
        expect(screen.getByText(/support@inkwell\.com/i)).toBeInTheDocument();
    });

    it('handles newsletter subscription', async () => {
        api.post.mockResolvedValueOnce({ data: {} });
        render(<MockFooter />);
        
        const input = screen.getByPlaceholderText(/Newsletter signup/i);
        const submitBtn = screen.getByText(/Join/i);

        fireEvent.change(input, { target: { value: 'test@example.com' } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/newsletter/subscribe', { email: 'test@example.com' });
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Welcome to the inner circle"));
        });
    });
});
