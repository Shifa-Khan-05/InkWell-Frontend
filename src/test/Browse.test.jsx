import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import Browse from '../pages/Browse';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';

vi.mock('../api/axios');

const MockBrowse = () => (
    <BrowserRouter>
        <ThemeProvider>
            <Browse />
        </ThemeProvider>
    </BrowserRouter>
);

describe('Browse Page', () => {
    const mockPosts = [
        {
            postId: '1',
            title: 'The Art of Writing',
            slug: 'art-of-writing',
            fullName: 'John Keats',
            excerpt: 'Exploring the depths of poetic structure...',
            readTimeMin: '5',
            featuredImageUrl: 'http://example.com/img1.jpg'
        },
        {
            postId: '2',
            title: 'Modern Architecture',
            slug: 'modern-architecture',
            fullName: 'Frank Wright',
            excerpt: 'Sustainable designs for the future...',
            readTimeMin: '8',
            featuredImageUrl: null
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders skeleton loading state initially', () => {
        api.get.mockReturnValue(new Promise(() => {}));
        render(<MockBrowse />);
        // Skeletons are divs with animate-pulse, difficult to query by text but we can check for structure or specific class
        expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('renders published posts correctly', async () => {
        api.get.mockResolvedValueOnce({ data: mockPosts });
        render(<MockBrowse />);

        await waitFor(() => {
            expect(screen.getByText(/The Art of Writing/i)).toBeInTheDocument();
            expect(screen.getByText(/John Keats/i)).toBeInTheDocument();
            expect(screen.getByText(/Modern Architecture/i)).toBeInTheDocument();
        });
    });

    it('filters posts based on search input', async () => {
        api.get.mockResolvedValueOnce({ data: mockPosts });
        render(<MockBrowse />);

        await waitFor(() => screen.getByText(/The Art of Writing/i));
        
        const searchInput = screen.getByPlaceholderText(/Search by title or author.../i);
        fireEvent.change(searchInput, { target: { value: 'Keats' } });

        expect(screen.getByText(/The Art of Writing/i)).toBeInTheDocument();
        expect(screen.queryByText(/Modern Architecture/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no posts match search', async () => {
        api.get.mockResolvedValueOnce({ data: mockPosts });
        render(<MockBrowse />);

        await waitFor(() => screen.getByText(/The Art of Writing/i));
        
        const searchInput = screen.getByPlaceholderText(/Search by title or author.../i);
        fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

        expect(screen.getByText(/No stories found/i)).toBeInTheDocument();
    });
});
