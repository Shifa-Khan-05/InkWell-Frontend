import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthorView from '../pages/AuthorView';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';
import { toast } from 'react-toastify';

vi.mock('../api/axios');
vi.mock('react-toastify');

const MockAuthorView = () => (
    <BrowserRouter>
        <AuthorView />
    </BrowserRouter>
);

describe('AuthorView Page', () => {
    const mockPosts = [
        { postId: 1, title: 'Draft Post', status: 'DRAFT', featuredImageUrl: null },
        { postId: 2, title: 'Published Post', status: 'PUBLISHED', featuredImageUrl: 'img.jpg' }
    ];

    const mockCategories = [{ categoryId: 1, name: 'Tech' }];
    const mockTags = [{ tagId: 1, name: 'React' }];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('userId', '123');
        api.get.mockImplementation((url) => {
            if (url.includes('/posts/author/')) return Promise.resolve({ data: mockPosts });
            if (url === '/taxonomy/categories') return Promise.resolve({ data: mockCategories });
            if (url === '/taxonomy/tags/trending') return Promise.resolve({ data: mockTags });
            return Promise.reject(new Error('not found'));
        });
    });

    it('renders manuscripts correctly', async () => {
        render(<MockAuthorView />);
        expect(await screen.findByText('Draft Post')).toBeInTheDocument();
        expect(screen.getByText('Published Post')).toBeInTheDocument();
    });

    it('opens modal for new narrative', async () => {
        render(<MockAuthorView />);
        const newBtn = await screen.findByText(/New Narrative/i);
        fireEvent.click(newBtn);
        expect(screen.getByPlaceholderText(/Headline.../i)).toBeInTheDocument();
    });

    it('handles tag toggling', async () => {
        render(<MockAuthorView />);
        fireEvent.click(await screen.findByText(/New Narrative/i));
        
        const tagBtn = await screen.findByText('#React');
        fireEvent.click(tagBtn);
        expect(tagBtn).toHaveClass('bg-primary/20'); // Selected state
        
        fireEvent.click(tagBtn);
        expect(tagBtn).not.toHaveClass('bg-primary/20'); // Unselected
    });

    it('submits a new post', async () => {
        api.post.mockResolvedValueOnce({});
        render(<MockAuthorView />);
        fireEvent.click(await screen.findByText(/New Narrative/i));

        fireEvent.change(screen.getByPlaceholderText(/Headline.../i), { target: { value: 'New Post' } });
        fireEvent.change(screen.getByPlaceholderText(/Begin your journey.../i), { target: { value: 'Content here' } });
        
        const publishBtn = screen.getByText(/Publish Manuscript/i);
        fireEvent.click(publishBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/posts/create', expect.any(FormData));
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("published"));
        });
    });

    it('handles manuscript deletion', async () => {
        window.confirm = vi.fn().mockReturnValue(true);
        api.delete.mockResolvedValueOnce({});
        render(<MockAuthorView />);

        const deleteBtns = await screen.findAllByRole('button');
        // Find the trash icon button - in our component it's the second one in the actions div
        const trashBtn = deleteBtns.find(btn => btn.innerHTML.includes('lucide-trash'));
        if (trashBtn) fireEvent.click(trashBtn);
        else {
            // Fallback if icon mock is weird
            const deleteAction = (await screen.findAllByRole('row'))[1].querySelectorAll('button')[1];
            fireEvent.click(deleteAction);
        }

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('/posts/1');
            expect(toast.warn).toHaveBeenCalledWith("Manuscript removed.");
        });
    });

    it('handles API failure gracefully', async () => {
        api.get.mockRejectedValueOnce(new Error('Fetch failed'));
        render(<MockAuthorView />);
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Network Error"));
        });
    });
});
