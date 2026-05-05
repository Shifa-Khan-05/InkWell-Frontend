import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import NotificationBell from '../components/NotificationBell';
import api from '../api/axios';

vi.mock('../api/axios');

describe('NotificationBell Component', () => {
  const mockNotifications = [
    { notificationId: 1, message: 'New comment', isRead: false, type: 'COMMENT', createdAt: new Date().toISOString() },
    { notificationId: 2, message: 'Liked your post', isRead: true, type: 'LIKE', createdAt: new Date().toISOString() }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('userId', '123');
    api.get.mockImplementation((url) => {
      if (url.includes('/notifications/user/')) return Promise.resolve({ data: mockNotifications });
      if (url.includes('/unread-count/')) return Promise.resolve({ data: 1 });
      return Promise.reject(new Error('not found'));
    });
  });

  it('should render the unread count badge', async () => {
    render(<NotificationBell />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeDefined();
    });
  });

  it('should open dropdown and show notifications when clicked', async () => {
    render(<NotificationBell />);
    
    await waitFor(() => screen.getByText('1'));
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('New comment')).toBeDefined();
    expect(screen.getByText('Liked your post')).toBeDefined();
    expect(screen.getByText('1 New Alerts')).toBeDefined();
  });

  it('should mark a notification as read when clicked', async () => {
    api.put.mockResolvedValue({ data: {} });
    render(<NotificationBell />);
    
    await waitFor(() => screen.getByText('1'));
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('New comment'));

    expect(api.put).toHaveBeenCalledWith('/notifications/1/read');
  });

  it('should mark all as read', async () => {
    api.put.mockResolvedValue({ data: {} });
    render(<NotificationBell />);
    
    await waitFor(() => screen.getByText('1'));
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByTitle('Mark all read'));

    expect(api.put).toHaveBeenCalledWith('/notifications/user/123/read-all');
  });

  it('should clear history', async () => {
    api.delete.mockResolvedValue({ data: {} });
    render(<NotificationBell />);
    
    await waitFor(() => screen.getByText('1'));
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByTitle('Clear history'));

    expect(api.delete).toHaveBeenCalledWith('/notifications/user/123/clean');
  });

  it('should handle refresh', async () => {
    render(<NotificationBell />);
    
    await waitFor(() => screen.getByText('1'));
    fireEvent.click(screen.getByRole('button'));
    
    const refreshBtn = screen.getByTitle('Refresh');
    fireEvent.click(refreshBtn);

    expect(api.get).toHaveBeenCalledTimes(4); // Initial 2 + Refresh 2
  });

  it('should show empty state if no notifications', async () => {
    api.get.mockImplementation((url) => {
        if (url.includes('/notifications/user/')) return Promise.resolve({ data: [] });
        if (url.includes('/unread-count/')) return Promise.resolve({ data: 0 });
        return Promise.reject(new Error('not found'));
    });

    render(<NotificationBell />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Quiet for now...')).toBeDefined();
  });
});
