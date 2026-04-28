import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Resource } from '../../types';

interface CreateResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResourceCreated: () => void;
}

const CreateResourceModal: React.FC<CreateResourceModalProps> = ({ isOpen, onClose, onResourceCreated }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [type, setType] = useState<'article' | 'recipe'>('article');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            showToast('Title and content are required.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const resourceData: Omit<Resource, 'id'> = {
                title,
                type,
                content,
                authorId: user!.id,
            };
            await api.createResource(resourceData);
            showToast('Resource created successfully!', 'success');
            onResourceCreated();
            onClose();
            // Reset form
            setTitle('');
            setType('article');
            setContent('');
        } catch (error) {
            showToast('Failed to create resource.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Resource">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select value={type} onChange={e => setType(e.target.value as 'article' | 'recipe')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="article">Article</option>
                        <option value="recipe">Recipe</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea id="content" rows={8} value={content} onChange={e => setContent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Create Resource</Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateResourceModal;