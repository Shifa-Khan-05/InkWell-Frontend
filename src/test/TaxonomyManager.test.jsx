import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TaxonomyManager from '../components/TaxonomyManager';
import api from '../api/axios';
import { ToastContainer } from 'react-toastify';

vi.mock('../api/axios');

describe('TaxonomyManager Component', () => {
  const mockCategories = [
    { categoryId: 1, name: 'Tech', slug: 'tech', postCount: 5, parentCategoryId: null },
    { categoryId: 2, name: 'Gadgets', slug: 'gadgets', postCount: 2, parentCategoryId: 1 }
  ];
  const mockTags = [
    { tagId: 1, name: 'React', slug: 'react' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url === '/taxonomy/categories') return Promise.resolve({ data: mockCategories });
      if (url === '/taxonomy/tags/trending') return Promise.resolve({ data: mockTags });
      return Promise.reject(new Error('not found'));
    });
  });

  it('should render categories and tags', async () => {
    render(<TaxonomyManager />);
    
    // Use findByRole for async elements with specific name to avoid duplicates
    expect(await screen.findByRole('heading', { name: /Tech/i })).toBeInTheDocument();
    expect(await screen.findByText(/#React/i)).toBeInTheDocument();
  });

  it('should create a new category', async () => {
    api.post.mockResolvedValue({ data: {} });
    render(
      <>
        <ToastContainer />
        <TaxonomyManager />
      </>
    );

    const input = await screen.findByRole('textbox', { name: /Category Name/i });
    fireEvent.change(input, { target: { value: 'New Category' } });
    
    // Find button by specific name to avoid ambiguity
    fireEvent.click(screen.getByRole('button', { name: /Create Category/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/taxonomy/categories', expect.objectContaining({ name: 'New Category' }));
      expect(screen.getByText(/Category Created!/i)).toBeInTheDocument();
    });
  });

  it('should handle category click to show CategoryPostView', async () => {
    api.get.mockImplementation((url) => {
        if (url === '/taxonomy/categories') return Promise.resolve({ data: mockCategories });
        if (url === '/taxonomy/tags/trending') return Promise.resolve({ data: mockTags });
        if (url.startsWith('/posts/category/')) return Promise.resolve({ data: [] });
        return Promise.reject(new Error('not found'));
    });

    render(<TaxonomyManager />);
    
    // Avoid ambiguous text matches by using more specific selector or role
    const techItems = await screen.findAllByText('Tech', { selector: 'span' }); 
    fireEvent.click(techItems[0]);

    expect(await screen.findByRole('heading', { name: /Posts in/i })).toBeInTheDocument();
    expect(screen.getByText('Tech', { selector: 'span.text-primary' })).toBeInTheDocument();
  });

  it('should handle API failure', async () => {
    api.get.mockRejectedValue(new Error('Failed'));
    render(
      <>
        <ToastContainer />
        <TaxonomyManager />
      </>
    );

    expect(await screen.findByText(/Failed to load taxonomy data\./i)).toBeInTheDocument();
  });

  it('should create a new tag', async () => {
    api.post.mockResolvedValue({ data: {} });
    render(
      <>
        <ToastContainer />
        <TaxonomyManager />
      </>
    );

    const input = await screen.findByPlaceholderText(/#newtag/i);
    fireEvent.change(input, { target: { value: 'NewTag' } });
    
    // Resolve multiple button ambiguity by using type or identifying class/label
    const tagSubmitBtn = screen.getByRole('button', { name: /add-tag/i }) || screen.getAllByRole('button').find(b => b.className.includes('bg-emerald-600'));
    fireEvent.click(tagSubmitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/taxonomy/tags', expect.objectContaining({ name: 'NewTag' }));
      expect(screen.getByText(/Tag Added!/i)).toBeInTheDocument();
    });
  });

  it('should handle category view back button', async () => {
    render(<TaxonomyManager />);
    const techItems = await screen.findAllByText('Tech', { selector: 'span' }); 
    fireEvent.click(techItems[0]);

    const backBtn = await screen.findByRole('button', { name: /Back/i });
    fireEvent.click(backBtn);

    expect(await screen.findByRole('heading', { name: /Category Hierarchy/i })).toBeInTheDocument();
  });
});
