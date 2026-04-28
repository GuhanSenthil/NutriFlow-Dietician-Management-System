import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Patient } from '../../types';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, patient }) => {
    const { refreshUser } = useAuth();
    const { showToast } = useToast();
    const [profileData, setProfileData] = useState({
        age: patient.profile.age || '',
        weight: patient.profile.weight || '',
        height: patient.profile.height || '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const updatedProfile = {
                age: Number(profileData.age) || undefined,
                weight: Number(profileData.weight) || undefined,
                height: Number(profileData.height) || undefined,
            };
            await api.updateUser(patient.id, { profile: updatedProfile });
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
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                    <input type="number" name="age" id="age" value={profileData.age} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input type="number" name="weight" id="weight" step="0.1" value={profileData.weight} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (cm)</label>
                    <input type="number" name="height" id="height" value={profileData.height} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProfileModal;