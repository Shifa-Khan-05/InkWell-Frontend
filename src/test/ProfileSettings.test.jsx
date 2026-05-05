import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfileSettings from '../components/ProfileSettings';
import api from '../api/axios';
import { ToastContainer } from 'react-toastify';

vi.mock('../api/axios');

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');

describe('ProfileSettings Component', () => {
  const mockProfile = {
    fullName: 'John Doe',
    username: 'johndoe',
    bio: 'Artist',
    age: 30,
    authProvider: 'LOCAL',
    profileImageUrl: 'old-img.jpg'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('userId', '123');
    api.get.mockResolvedValue({ data: mockProfile });
  });

  it('should fetch and display profile data', async () => {
    render(
      <MemoryRouter>
        <ProfileSettings />
      </MemoryRouter>
    );

    // Use findByDisplayValue for async load stability
    expect(await screen.findByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('johndoe')).toBeInTheDocument();
  });

  it('should update profile fields and submit', async () => {
    api.put.mockResolvedValue({ data: { ...mockProfile, fullName: 'Jane Doe' } });
    render(
      <MemoryRouter>
        <ToastContainer />
        <ProfileSettings />
      </MemoryRouter>
    );

    const fullNameInput = await screen.findByLabelText(/Full Name/i);
    fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } });
    
    // Target specific button by its full text or role name
    fireEvent.click(screen.getByRole('button', { name: /Save InkWell Identity/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/auth/profile/123/upload', expect.any(FormData));
      expect(screen.getByText(/Identity Updated Successfully! ✨/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    render(
      <MemoryRouter>
        <ProfileSettings />
      </MemoryRouter>
    );

    const passwordInput = await screen.findByLabelText(/Update Password/i);
    expect(passwordInput.type).toBe('password');

    // Use specific title, aria-label or index to avoid ambiguous button match
    const toggleBtn = screen.getByLabelText(/Show Password/i) || screen.getAllByRole('button').find(b => b.querySelector('svg')); 
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');
  });

  it('should handle file selection', async () => {
    render(
      <MemoryRouter>
        <ProfileSettings />
      </MemoryRouter>
    );

    await screen.findByAltText(/Avatar/i);
    
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Update Avatar/i);
    
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByAltText(/Avatar/i).src).toContain('mock-url');
  });

  it('should show Google verified badge for OAuth users', async () => {
    api.get.mockResolvedValue({ data: { ...mockProfile, authProvider: 'GOOGLE' } });
    render(
      <MemoryRouter>
        <ProfileSettings />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Verified via Google/i)).toBeInTheDocument();
  });
});
