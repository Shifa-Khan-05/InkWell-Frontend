import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import Navbar from '../components/Navbar';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';

vi.mock('../api/axios');

const MockNavbar = () => (
  <BrowserRouter>
    <ThemeProvider>
      <Navbar />
    </ThemeProvider>
  </BrowserRouter>
);

describe('InkWell Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  
  it('renders the InkWell title', () => {
    render(<MockNavbar />);
    const titleElement = screen.getByRole('heading', { name: /InkWell/i });
    expect(titleElement).toBeInTheDocument();
  });

  it('toggles the theme icon when clicked', () => {
    render(<MockNavbar />);
    const themeBtn = screen.getByLabelText(/Toggle Theme/i);
    
    fireEvent.click(themeBtn);
  });

  it('shows Login button when user is not logged in', () => {
    render(<MockNavbar />);
    const loginLink = screen.getByText(/Log in/i);
    expect(loginLink).toBeInTheDocument();
  });

  it('shows Dashboard and Logout when user is logged in', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('userId', '123');
    api.get.mockResolvedValueOnce({ data: { fullName: 'John Doe', profileImageUrl: '' } });
    
    render(<MockNavbar />);
    
    expect(await screen.findByText(/Dashboard/i)).toBeInTheDocument();
    expect(await screen.findByText(/Logout/i)).toBeInTheDocument();
    
    expect(api.get).toHaveBeenCalledWith('/auth/profile/123');
  });

  it('handles logout correctly', () => {
    localStorage.setItem('token', 'fake-token');
    render(<MockNavbar />);
    
    const logoutBtn = screen.getByText(/Logout/i);
    fireEvent.click(logoutBtn);
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByText(/Log in/i)).toBeInTheDocument();
  });
});