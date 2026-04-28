

import React, { useState, useMemo } from 'react';
import { AppUser, User } from '../../types';
import Card from '../common/Card';
import Icon from '../common/Icon';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useToast } from '../../hooks/useToast';
import { api } from '../../services/api';

interface UserManagementTableProps {
  title: string;
  users: AppUser[];
  onUserUpdate: (user: User) => void;
  isLoading: boolean;
}

const SkeletonRow: React.FC = () => (
    <tr>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
             <div className="flex justify-end items-center space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
        </td>
    </tr>
);


const UserManagementTable: React.FC<UserManagementTableProps> = ({ title, users, onUserUpdate, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingUser, setEditingUser] = useState<AppUser | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const { showToast } = useToast();
    const USERS_PER_PAGE = 5;

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * USERS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

    const handleStatusToggle = async (user: AppUser) => {
        const newStatus = user.status === 'active' ? 'deactivated' : 'active';
        try {
            const updatedUser = await api.updateUser(user.id, { status: newStatus });
            onUserUpdate(updatedUser as User);
            showToast(`User ${newStatus}.`, 'success');
        } catch (error) {
            showToast('Failed to update user status.', 'error');
        }
    };
    
    const handleNameUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsUpdating(true);
        try {
            const updatedUser = await api.updateUser(editingUser.id, { name: editingUser.name });
            onUserUpdate(updatedUser as User);
            showToast('User name updated.', 'success');
            setEditingUser(null);
        } catch (error) {
            showToast('Failed to update name.', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : paginatedUsers.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No users found.</td></tr>
                            ) : (
                                paginatedUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}><Icon name="edit" className="h-4 w-4"/></Button>
                                                <Button 
                                                    variant={user.status === 'active' ? 'danger' : 'secondary'} 
                                                    size="sm"
                                                    onClick={() => handleStatusToggle(user)}
                                                >
                                                    {user.status === 'active' ? 'Deactivate' : 'Reactivate'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                        <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                        <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                    </div>
                )}
            </Card>

            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User Name">
                {editingUser && (
                    <form onSubmit={handleNameUpdate}>
                         <div className="relative">
                            <input id="name" type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-primary-600" placeholder="Full Name" />
                            <label htmlFor="name" className="absolute left-0 -top-3.5 text-gray-600 text-sm">Full Name</label>
                        </div>
                        <div className="mt-6 flex justify-end space-x-2">
                            <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
                            <Button type="submit" isLoading={isUpdating}>Save Changes</Button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default UserManagementTable;