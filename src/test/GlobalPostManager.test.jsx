import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import GlobalPostManager from '../components/GlobalPostManager';
import api from '../api/axios';
import { ToastContainer } from 'react-toastify';

vi.mock('../api/axios');

describe('GlobalPostManager Component', () => {
  const mockPosts = [
    { postId: 1, title: 'Global Post 1', fullName: 'Author 1', status: 'PUBLISHED', slug: 'post-1' },
    { postId: 2, title: 'Global Post 2', fullName: 'Author 2', status: 'DRAFT', slug: 'post-2' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: mockPosts });
  });

  it('should render all posts', async () => {
    render(<GlobalPostManager />);
    
    expect(await screen.findByText('Global Post 1')).toBeDefined();
    expect(screen.getByText('Global Post 2')).toBeDefined();
    expect(screen.getByText('Author 1')).toBeDefined();
  });

  it('should handle post deletion by admin', async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    api.delete.mockResolvedValue({ data: {} });
    
    render(
      <>
        <ToastContainer />
        <GlobalPostManager />
      </>
    );

    await screen.findByText('Global Post 1');
    
    // Find delete button - it has an Eye and Trash icon, so we use role and name if possible or test-id
    // But since they are lucide icons, I'll use queryAllByRole('button') and find the one with Trash2
    const deleteButtons = screen.getAllByRole('button');
    // The second button in each row is delete (Eye then Trash)
    fireEvent.click(deleteButtons[1]); 

    expect(window.confirm).toHaveBeenCalled();
    expect(api.delete).toHaveBeenCalledWith('/posts/1');
    await waitFor(() => {
        expect(screen.getByText('Content removed by Admin.')).toBeDefined();
    });
  });

  it('should handle API failure', async () => {
    api.get.mockRejectedValue(new Error('Failed'));
    render(
      <>
        <ToastContainer />
        <GlobalPostManager />
      </>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load global library.')).toBeDefined();
    });
  });
});
