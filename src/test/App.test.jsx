import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import { ThemeProvider } from '../hooks/ThemeContext';

// Mock components to avoid deep rendering issues in App test
vi.mock('../components/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('../pages/Home', () => ({ default: () => <div>Home Page</div> }));
vi.mock('../pages/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('../pages/Login', () => ({ default: () => <div>Login Page</div> }));

describe('App Component', () => {
  it('should render Navbar on Home route', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    );
    expect(screen.getByTestId('navbar')).toBeDefined();
    expect(screen.getByText('Home Page')).toBeDefined();
  });

  it('should hide Navbar on Dashboard route', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    );
    expect(screen.queryByTestId('navbar')).toBeNull();
    expect(screen.getByText('Dashboard Page')).toBeDefined();
  });

  it('should render Login page on /login route', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    );
    expect(screen.getByText('Login Page')).toBeDefined();
  });
});
