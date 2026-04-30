import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import ResetPassword from '../components/ResetPassword';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';
import { toast } from 'react-toastify';

// Mocking external dependencies to isolate the component
vi.mock('../api/axios');
vi.mock('react-toastify');

// Mocking framer-motion to avoid animation-related issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

// MockWrapper wraps the component in necessary providers as per requirements
const MockResetPassword = () => (
    <BrowserRouter>
        <ThemeProvider>
            <ResetPassword />
        </ThemeProvider>
    </BrowserRouter>
);

describe('ResetPassword Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset URL to a clean state with a mock token if needed
        window.history.pushState({}, 'Test page', '/reset-password?token=mock-security-token-123');
    });

    it('renders the reset password form correctly', () => {
        // Arrange
        render(<MockResetPassword />);

        // Assert
        expect(screen.getByText(/Refine Credentials/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/New Password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Confirm New Password/i)).toBeInTheDocument();
        expect(screen.getByText(/Update Password/i)).toBeInTheDocument();
    });

    it('shows an error toast if passwords do not match', () => {
        // Arrange
        render(<MockResetPassword />);
        const passwordInput = screen.getByPlaceholderText('New Password');
        const confirmInput = screen.getByPlaceholderText('Confirm New Password');
        const submitBtn = screen.getByText(/Update Password/i);

        // Act
        fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
        fireEvent.change(confirmInput, { target: { value: 'WrongPass456!' } });
        fireEvent.click(submitBtn);

        // Assert
        expect(toast.error).toHaveBeenCalledWith("Passwords do not match.");
    });

    it('calls the reset password API and shows success message on valid input', async () => {
        // Arrange
        api.post.mockResolvedValueOnce({ data: { message: 'Success' } });
        render(<MockResetPassword />);
        
        const passwordInput = screen.getByPlaceholderText('New Password');
        const confirmInput = screen.getByPlaceholderText('Confirm New Password');
        const submitBtn = screen.getByText(/Update Password/i);

        // Act
        fireEvent.change(passwordInput, { target: { value: 'NewSecret789!' } });
        fireEvent.change(confirmInput, { target: { value: 'NewSecret789!' } });
        fireEvent.click(submitBtn);

        // Assert
        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
                token: 'mock-security-token-123',
                newPassword: 'NewSecret789!'
            });
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Security protocols updated"));
        });
    });

    it('shows error toast when the API call fails (invalid token)', async () => {
        // Arrange
        api.post.mockRejectedValueOnce(new Error('Invalid token'));
        render(<MockResetPassword />);
        
        const passwordInput = screen.getByPlaceholderText('New Password');
        const confirmInput = screen.getByPlaceholderText('Confirm New Password');
        const submitBtn = screen.getByText(/Update Password/i);

        // Act
        fireEvent.change(passwordInput, { target: { value: 'NewSecret789!' } });
        fireEvent.change(confirmInput, { target: { value: 'NewSecret789!' } });
        fireEvent.click(submitBtn);

        // Assert
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Security token invalid or expired.");
        });
    });

    it('shows "Updating..." state and disables the button during submission', async () => {
        // Arrange
        // Mock a slow API response to capture the loading state
        api.post.mockReturnValue(new Promise(resolve => setTimeout(resolve, 100)));
        render(<MockResetPassword />);
        
        const passwordInput = screen.getByPlaceholderText('New Password');
        const confirmInput = screen.getByPlaceholderText('Confirm New Password');
        const submitBtn = screen.getByText(/Update Password/i);

        // Act
        fireEvent.change(passwordInput, { target: { value: 'NewSecret789!' } });
        fireEvent.change(confirmInput, { target: { value: 'NewSecret789!' } });
        fireEvent.click(submitBtn);

        // Assert
        expect(screen.getByText(/Updating.../i)).toBeInTheDocument();
        expect(submitBtn).toBeDisabled();
    });

});
