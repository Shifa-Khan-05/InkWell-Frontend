import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/ThemeContext';
import ModerationQueue from '../components/ModerationQueue';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api from '../api/axios';
import { toast } from 'react-toastify';

vi.mock('../api/axios');
vi.mock('react-toastify');

const MockModerationQueue = () => (
    <BrowserRouter>
        <ThemeProvider>
            <ModerationQueue />
        </ThemeProvider>
    </BrowserRouter>
);

describe('ModerationQueue Component', () => {
    const mockComments = [
        { commentId: '1', authorName: 'Alice', content: 'Great post!', createdAt: '2026-04-28T10:00:00Z' },
        { commentId: '2', authorName: 'Bob', content: 'I disagree.', createdAt: '2026-04-28T11:00:00Z' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        api.get.mockReturnValue(new Promise(() => {}));
        render(<MockModerationQueue />);
        expect(screen.getByText(/Scanning Discussions.../i)).toBeInTheDocument();
    });

    it('renders pending comments', async () => {
        api.get.mockResolvedValueOnce({ data: mockComments });
        render(<MockModerationQueue />);

        await waitFor(() => {
            expect(screen.getByText(/"Great post!"/i)).toBeInTheDocument();
            expect(screen.getByText(/"I disagree."/i)).toBeInTheDocument();
            expect(screen.getByText(/Alice/i)).toBeInTheDocument();
        });
    });

    it('handles comment approval', async () => {
        api.get.mockResolvedValueOnce({ data: [mockComments[0]] });
        api.put.mockResolvedValueOnce({});
        
        render(<MockModerationQueue />);

        expect(await screen.findByText(/"Great post!"/i)).toBeInTheDocument();
        
        const approveBtn = screen.getByTitle('Approve');
        fireEvent.click(approveBtn);

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith('/comments/1/approve');
            expect(toast.success).toHaveBeenCalledWith("Comment approved!");
        });

        expect(screen.queryByText(/"Great post!"/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no comments are pending', async () => {
        api.get.mockResolvedValueOnce({ data: [] });
        render(<MockModerationQueue />);

        await waitFor(() => {
            expect(screen.getByText(/No discussions awaiting review/i)).toBeInTheDocument();
        });
    });
});
