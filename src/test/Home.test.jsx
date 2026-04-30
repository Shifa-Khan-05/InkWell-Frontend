import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocking framer-motion to avoid animation-related issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
    },
}));

// Mocking Footer to isolate Home component
vi.mock('../components/Footer', () => ({
    default: () => <footer data-testid="mock-footer">Footer</footer>,
}));

const MockHome = () => (
    <BrowserRouter>
        <Home />
    </BrowserRouter>
);

describe('Home Page', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders the hero section with the main title', () => {
        render(<MockHome />);
        expect(screen.getByText(/Write. Publish./i)).toBeInTheDocument();
        expect(screen.getByText(/Captivate./i)).toBeInTheDocument();
        expect(screen.getByText(/InkWell is the artisan's platform/i)).toBeInTheDocument();
    });

    it('shows registration and exploration links for guest users', () => {
        render(<MockHome />);
        expect(screen.getByText(/Start Your Manuscript/i)).toBeInTheDocument();
        expect(screen.getByText(/Explore Library/i)).toBeInTheDocument();
        expect(screen.queryByText(/Go to Workbench/i)).not.toBeInTheDocument();
    });

    it('shows workbench link for logged in users', () => {
        localStorage.setItem('token', 'fake-token');
        render(<MockHome />);
        expect(screen.getByText(/Go to Workbench/i)).toBeInTheDocument();
        expect(screen.queryByText(/Start Your Manuscript/i)).not.toBeInTheDocument();
    });

    it('renders the features section', () => {
        render(<MockHome />);
        expect(screen.getByText(/Artisan Editor/i)).toBeInTheDocument();
        expect(screen.getByText(/Impact Analytics/i)).toBeInTheDocument();
        expect(screen.getByText(/Cloud Engine/i)).toBeInTheDocument();
    });

    it('renders the call to action section', () => {
        render(<MockHome />);
        expect(screen.getByText(/Your next masterpiece starts here/i)).toBeInTheDocument();
        // Check for the CTA button
        const ctaButtons = screen.getAllByText(/Get Started Now/i);
        expect(ctaButtons.length).toBeGreaterThan(0);
    });

    it('includes the Footer component', () => {
        render(<MockHome />);
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });
});
