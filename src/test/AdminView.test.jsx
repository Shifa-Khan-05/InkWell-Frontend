import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminView from '../pages/AdminView';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import api, { webApi } from '../api/axios';
import { toast } from 'react-toastify';

vi.mock('../api/axios');
vi.mock('react-toastify');

const MockAdminView = () => (
    <BrowserRouter>
        <AdminView />
    </BrowserRouter>
);

describe('AdminView Page', () => {
    const mockSummary = {
        users: [
            { userId: '1', fullName: 'John Doe', email: 'john@example.com', role: 'ROLE_READER', profileImageUrl: null },
            { userId: '2', fullName: 'Admin User', email: 'admin@example.com', role: 'ROLE_ADMIN', profileImageUrl: null }
        ],
        totalPosts: 10,
        platformStatus: 'Operational'
    };

    const mockRoleRequests = [
        { requestId: '101', user: { fullName: 'Requester', email: 'req@ex.com' }, requestedRole: 'AUTHOR', status: 'PENDING' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        webApi.get.mockResolvedValue({ data: mockSummary });
        api.get.mockResolvedValue({ data: mockRoleRequests });
    });

    it('renders admin metrics and user list', async () => {
        render(<MockAdminView />);
        expect(await screen.findByText('10')).toBeInTheDocument(); // Posts
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Operational')).toBeInTheDocument();
    });

    it('handles role change', async () => {
        api.put.mockResolvedValueOnce({});
        render(<MockAdminView />);
        
        const roleBtns = await screen.findAllByRole('button');
        // Find the UserCheck icon button
        const changeBtn = roleBtns.find(btn => btn.innerHTML.includes('lucide-user-check'));
        fireEvent.click(changeBtn);

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith(expect.stringContaining('/auth/users/1/role?newRole=AUTHOR'));
            expect(toast.success).toHaveBeenCalledWith("Role protocol updated! ✨");
        });
    });

    it('handles role request approval', async () => {
        api.put.mockResolvedValueOnce({});
        render(<MockAdminView />);
        
        const approveBtn = await screen.findByText('Approve');
        fireEvent.click(approveBtn);

        await waitFor(() => {
            expect(api.put).toHaveBeenCalledWith('/auth/role-requests/101?status=APPROVED');
            expect(toast.success).toHaveBeenCalledWith("Role request approved!");
        });
    });

    it('handles user deletion', async () => {
        window.confirm = vi.fn().mockReturnValue(true);
        api.delete.mockResolvedValueOnce({});
        render(<MockAdminView />);
        
        const roleBtns = await screen.findAllByRole('button');
        const deleteBtn = roleBtns.find(btn => btn.innerHTML.includes('lucide-trash'));
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(api.delete).toHaveBeenCalledWith('/auth/users/1');
            expect(toast.success).toHaveBeenCalledWith("Identity erased successfully.");
        });
    });

    it('handles API failure gracefully', async () => {
        webApi.get.mockRejectedValueOnce(new Error('Auth failed'));
        render(<MockAdminView />);
        expect(await screen.findByText("Command Center Access Denied.")).toBeDefined();
    });
});
