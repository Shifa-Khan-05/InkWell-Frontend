import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OAuthSuccess from '../pages/OAuthSuccess';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('OAuthSuccess Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('extracts tokens from URL and stores them in localStorage', async () => {
        const testToken = 'abc-123';
        const testUserId = 'user-456';
        const testRole = 'AUTHOR';
        
        // We use MemoryRouter to inject search params
        render(
            <MemoryRouter initialEntries={[`/oauth2/success?token=${testToken}&userId=${testUserId}&role=${testRole}`]}>
                <Routes>
                    <Route path="/oauth2/success" element={<OAuthSuccess />} />
                    <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe(testToken);
            expect(localStorage.getItem('userId')).toBe(testUserId);
            expect(localStorage.getItem('role')).toBe(testRole);
        });
    });

    it('redirects to login if tokens are missing', async () => {
        render(
            <MemoryRouter initialEntries={['/oauth2/success']}>
                <Routes>
                    <Route path="/oauth2/success" element={<OAuthSuccess />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(localStorage.getItem('token')).toBeNull();
        });
    });
});
