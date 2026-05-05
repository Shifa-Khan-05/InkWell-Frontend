import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import usePageTitle from '../hooks/usePageTitle';

describe('usePageTitle Hook', () => {
  beforeEach(() => {
    document.title = 'Default';
  });

  it('should set the document title with prefix', () => {
    renderHook(() => usePageTitle('Dashboard'));
    expect(document.title).toBe('InkWell | Dashboard');
  });

  it('should set the document title to default if no title is provided', () => {
    renderHook(() => usePageTitle(''));
    expect(document.title).toBe('InkWell');
  });
});
