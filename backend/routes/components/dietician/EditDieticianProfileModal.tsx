import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Dietician } from '../../../../types';
import Button from '../common/Button';
import { api } from '../../../../services/api';
import { useAuth } from '../../../../hooks/useAuth';
import { useToast } from '../../../../hooks/useToast';

interface EditDieticianProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    dietician: Dietician;
}

const EditDieticianProfileModal: React.FC<EditDieticianProfileModalProps> = ({ isOpen, onClose, dietician }) => {
    const { refreshUser } = useAuth();
    const { showToast } = useToast();
    const [profileData, setProfileData] = useState({
        name: '',
        specialization: '',
        bio: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (dietician) {
            setProfileData({
                name: dietician.name,
                specialization: dietician.specialization,
                bio: dietician.bio,
            });
        }
    }, [dietician]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.updateUser(dietician.id, { ...profileData });
            await refreshUser();
            showToast('Profile updated successfully!', 'success');
            onClose();
        } catch (error) {
            showToast('Failed to update profile.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="name" id="name" value={profileData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Specialization</label>
                    <input type="text" name="specialization" id="specialization" value={profileData.specialization} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., Clinical Nutrition, Sports Nutrition" />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Professional Bio</label>
                    <textarea name="bio" id="bio" rows={4} value={profileData.bio} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Tell patients about your experience and approach..."></textarea>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditDieticianProfileModal;