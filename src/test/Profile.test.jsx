import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import Profile from '../components/Profile';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';
import { toast } from 'react-toastify';

vi.mock('../api/axios');
vi.mock('react-toastify');

const MockProfile = () => (
    <BrowserRouter>
        <ThemeProvider>
            <Profile />
        </ThemeProvider>
    </BrowserRouter>
);

describe('Profile Component', () => {
    const mockUserData = {
        fullName: 'Jane Doe',
        username: 'janedoe',
        bio: 'Writer and Dreamer',
        age: '28',
        authProvider: 'LOCAL',
        profileImageUrl: 'http://example.com/image.jpg'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('userId', '123');
        // URL.createObjectURL is not available in JSDOM by default
        global.URL.createObjectURL = vi.fn(() => 'mock-url');
    });

    it('renders loader initially', () => {
        api.get.mockReturnValue(new Promise(() => {})); // Never resolves
        render(<MockProfile />);
        expect(screen.getByText(/Syncing Identity.../i)).toBeInTheDocument();
    });

    it('renders profile in view mode', async () => {
        api.get.mockResolvedValueOnce({ data: mockUserData });
        render(<MockProfile />);

        await waitFor(() => {
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
            expect(screen.getByText('@janedoe')).toBeInTheDocument();
            expect(screen.getByText(/"Writer and Dreamer"/i)).toBeInTheDocument();
        });
        
        expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();
    });

    it('switches to edit mode and updates profile', async () => {
        api.get.mockResolvedValueOnce({ data: mockUserData });
        api.put.mockResolvedValueOnce({ data: { ...mockUserData, fullName: 'Jane Smith' } });
        
        render(<MockProfile />);

        await waitFor(() => screen.getByText('Jane Doe'));
        
        const editBtn = screen.getByText(/Edit Profile/i);
        fireEvent.click(editBtn);

        // Assert we are in edit mode
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
        
        const nameInput = screen.getByLabelText(/Full Name/i);
        fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
        
        const saveBtn = screen.getByText(/Save InkWell Identity/i);
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(api.put).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Identity Updated"));
        });
    });

    it('toggles password visibility in edit mode', async () => {
        api.get.mockResolvedValueOnce({ data: mockUserData });
        render(<MockProfile />);

        await waitFor(() => screen.getByText(/Edit Profile/i));
        fireEvent.click(screen.getByText(/Edit Profile/i));

        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        expect(passwordInput.type).toBe('password');

        // Toggle eye button
        const toggleBtn = screen.getByPlaceholderText(/••••••••/i).parentElement.querySelector('button');
        fireEvent.click(toggleBtn);
        expect(passwordInput.type).toBe('text');
    });
});
