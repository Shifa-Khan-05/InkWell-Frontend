import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import NewsletterManager from '../pages/NewsletterManager';
import api from '../api/axios';
import { ToastContainer } from 'react-toastify';

vi.mock('../api/axios');

describe('NewsletterManager Page', () => {
  const mockSubscribers = [
    { id: 1, email: 'sub1@test.com', subscribedAt: new Date().toISOString() },
    { id: 2, email: 'sub2@test.com', subscribedAt: new Date().toISOString() }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: mockSubscribers });
  });

  it('should render subscribers and default broadcast form', async () => {
    render(<NewsletterManager />);
    
    expect(await screen.findByText('sub1@test.com')).toBeDefined();
    expect(screen.getByText('Broadcast Dispatch')).toBeDefined();
    expect(screen.getByPlaceholderText('Subject Line')).toBeDefined();
  });

  it('should switch to targeted email mode', async () => {
    render(<NewsletterManager />);
    
    await screen.findByText('sub1@test.com');
    const switchBtn = screen.getByText(/Switch to Targeted User/i);
    fireEvent.click(switchBtn);

    expect(screen.getByText('Targeted Email')).toBeDefined();
    expect(screen.getByLabelText('Recipient Email')).toBeDefined();
  });

  it('should send broadcast to all subscribers', async () => {
    api.post.mockResolvedValue({ data: {} });
    render(
      <>
        <ToastContainer />
        <NewsletterManager />
      </>
    );

    await screen.findByText('sub1@test.com');
    
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Hey All' } });
    fireEvent.change(screen.getByLabelText('Email Body'), { target: { value: 'Check out my new post!' } });
    
    const sendBtn = screen.getByRole('button', { name: /Broadcast to 2 Readers/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/newsletter/broadcast', {
        subject: 'Hey All',
        body: 'Check out my new post!'
      });
      expect(screen.getByText('Broadcast sent to 2 narratives! 🚀')).toBeDefined();
    });
  });

  it('should send direct mail to selected subscriber', async () => {
    api.post.mockResolvedValue({ data: {} });
    render(
      <>
        <ToastContainer />
        <NewsletterManager />
      </>
    );

    await screen.findByText('sub1@test.com');
    
    // Clicking a subscriber should switch to targeted mode and fill email
    fireEvent.click(screen.getByText('sub1@test.com'));

    expect(screen.getByLabelText('Recipient Email').value).toBe('sub1@test.com');
    
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Personal' } });
    fireEvent.change(screen.getByLabelText('Email Body'), { target: { value: 'Hi sub1' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Send to Single User/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/newsletter/direct-mail', expect.objectContaining({
        email: 'sub1@test.com',
        subject: 'Personal'
      }));
      expect(screen.getByText('Sent directly to sub1@test.com! 🚀')).toBeDefined();
    });
  });

  it('should handle broadcast failure when list is empty', async () => {
    api.get.mockResolvedValue({ data: [] });
    render(
      <>
        <ToastContainer />
        <NewsletterManager />
      </>
    );

    await waitFor(() => screen.getByText('No readers have joined your newsletter yet.'));
    
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Hey' } });
    fireEvent.change(screen.getByLabelText('Email Body'), { target: { value: 'Body' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Broadcast to 0 Readers/i }));

    expect(screen.getByText('No readers in your audience list!')).toBeDefined();
  });
});
