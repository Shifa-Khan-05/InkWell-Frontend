import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MediaLibrary from '../components/MediaLibrary';
import api from '../api/axios';
import { ToastContainer } from 'react-toastify';

vi.mock('../api/axios');

describe('MediaLibrary Component', () => {
  const mockMedia = [
    { mediaId: 1, url: 'img1.jpg', altText: 'Img 1', originalName: 'img1.jpg', sizeKb: 100, mimeType: 'image/jpeg', uploaderId: 123 },
    { mediaId: 2, url: 'img2.png', altText: 'Img 2', originalName: 'img2.png', sizeKb: 200, mimeType: 'image/png', uploaderId: 124 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('userId', '123');
    api.get.mockResolvedValue({ data: mockMedia });
  });

  it('should render media library for user', async () => {
    render(<MediaLibrary />);
    
    // Case-insensitive regex for filenames and findByText for async stability
    expect(await screen.findByText(/img1\.jpg/i)).toBeInTheDocument();
    expect(await screen.findByText(/img2\.png/i)).toBeInTheDocument();
  });

  it('should render global assets for admin', async () => {
    render(<MediaLibrary isAdminMode={true} />);
    
    expect(await screen.findByText(/Global Assets/i)).toBeInTheDocument();
    expect(await screen.findByText(/UID: 123/i)).toBeInTheDocument();
  });

  it('should upload a file', async () => {
    api.post.mockResolvedValue({ data: {} });
    render(
      <>
        <ToastContainer />
        <MediaLibrary />
      </>
    );

    expect(await screen.findByText(/Add Asset/i)).toBeInTheDocument();
    
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload Media/i); 
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/media/upload', expect.any(FormData), expect.any(Object));
      expect(screen.getByText(/Asset added to vault! 🖼️/i)).toBeInTheDocument();
    });
  });

  it('should delete a media item', async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    api.delete.mockResolvedValue({ data: {} });
    render(
      <>
        <ToastContainer />
        <MediaLibrary />
      </>
    );

    // Multiple delete buttons exist, use specific title and index or aria-label
    const deleteButtons = await screen.findAllByTitle(/Delete/i);
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.delete).toHaveBeenCalledWith('/media/1');
    
    expect(await screen.findByText(/Asset deleted\./i)).toBeInTheDocument();
  });

  it('should handle API failure', async () => {
    api.get.mockRejectedValue(new Error('Failed'));
    render(
      <>
        <ToastContainer />
        <MediaLibrary />
      </>
    );

    expect(await screen.findByText(/Failed to sync media library\./i)).toBeInTheDocument();
  });
});
