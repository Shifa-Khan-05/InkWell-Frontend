import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import PostDetails from '../pages/PostDetails';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api, { webApi } from '../api/axios';
import { toast } from 'react-toastify';

vi.mock('../api/axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
    webApi: {
        get: vi.fn(),
    }
}));
vi.mock('react-toastify');

const MockPostDetails = ({ initialEntries = ['/post/test-slug'] }) => (
    <MemoryRouter initialEntries={initialEntries}>
        <ThemeProvider>
            <Routes>
                <Route path="/post/:slug" element={<PostDetails />} />
                <Route path="/browse" element={<div>Browse Page</div>} />
            </Routes>
        </ThemeProvider>
    </MemoryRouter>
);

describe('PostDetails Page', () => {
    const mockPostData = {
        post: {
            postId: '1',
            title: 'Test Post',
            content: 'Detailed content of the test post.',
            fullName: 'Author Name',
            authorId: 'auth1',
            likesCount: 10,
            likedByCurrentUser: false,
            featuredImageUrl: 'http://example.com/img.jpg',
            readTimeMin: '5'
        },
        comments: [
            { commentId: 'c1', authorName: 'User1', content: 'Nice post!', createdAt: '2026-04-28T10:00:00Z' }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('userId', '123');
        localStorage.setItem('role', 'READER');
    });

    it('renders loading state initially', () => {
        webApi.get.mockReturnValue(new Promise(() => {}));
        render(<MockPostDetails />);
        expect(screen.getByText(/Assembling Narrative\.\.\./i)).toBeInTheDocument();
    });

    it('renders post details and comments correctly', async () => {
        webApi.get.mockResolvedValueOnce({ data: mockPostData });
        api.get.mockResolvedValueOnce({ data: false }); // is-saved
        
        render(<MockPostDetails />);

        expect(await screen.findByText('Test Post')).toBeInTheDocument();
        expect(screen.getByText(/Detailed content/i)).toBeInTheDocument();
        expect(screen.getByText(/Author Name/i)).toBeInTheDocument();
        expect(screen.getByText('Nice post!')).toBeInTheDocument();
    });

    it('handles liking a post', async () => {
        webApi.get.mockResolvedValueOnce({ data: mockPostData });
        api.get.mockResolvedValueOnce({ data: false });
        api.post.mockResolvedValueOnce({});

        render(<MockPostDetails />);

        const likesCount = await screen.findByText('10');
        const likeBtn = likesCount.closest('button') || likesCount.parentElement;
        fireEvent.click(likeBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/posts/1/like?userId=123', undefined);
            expect(screen.getByText('11')).toBeInTheDocument();
        });
    });

    it('handles saving a post (Pro feature check)', async () => {
        webApi.get.mockResolvedValueOnce({ data: mockPostData });
        api.get.mockResolvedValueOnce({ data: false });
        
        render(<MockPostDetails />);

        expect(await screen.findByText('Test Post')).toBeInTheDocument();
        
        // Use more specific button query instead of closest()
        const saveBtn = screen.getByRole('button', { name: /Library/i });
        fireEvent.click(saveBtn);

        expect(toast.warning).toHaveBeenCalledWith(
            expect.stringContaining("Saving Manuscripts is a Pro feature! ✨"),
            expect.any(Object)
        );

        // Change to ADMIN (pro)
        localStorage.setItem('role', 'ADMIN');
        api.post.mockResolvedValueOnce({});
        
        fireEvent.click(saveBtn);
        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/posts/1/save?userId=123');
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("Saved to Library"));
        });
    });

    it('handles submitting a new comment', async () => {
        webApi.get.mockResolvedValueOnce({ data: mockPostData });
        api.get.mockResolvedValueOnce({ data: false });
        api.post.mockResolvedValueOnce({});

        render(<MockPostDetails />);

        const textarea = await screen.findByPlaceholderText(/Share your thoughts\.\.\./i);
        fireEvent.change(textarea, { target: { value: 'New insightful comment' } });
        
        // Use type="submit" or specific button class/label to resolve ambiguity
        const submitBtn = screen.getByRole('button', { name: /send/i }) || screen.getAllByRole('button').find(b => b.innerHTML.includes('lucide-send'));
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith('/comments/add', expect.objectContaining({
                content: 'New insightful comment'
            }));
            // Match the exact toast message with emoji
            expect(toast.info).toHaveBeenCalledWith(
                expect.stringContaining("Narrative submitted for moderation. 🛡️"),
                expect.any(Object)
            );
        });
    });

    it('handles API failure gracefully', async () => {
        webApi.get.mockRejectedValueOnce(new Error('Fetch failed'));
        
        render(<MockPostDetails />);

        expect(await screen.findByText(/Manuscript not found\./i)).toBeInTheDocument();
    });
});
