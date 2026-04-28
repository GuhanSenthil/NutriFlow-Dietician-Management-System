import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Patient, Resource } from '../../types';
import { api } from '../../services/api';
import Spinner from '../common/Spinner';
import Card from '../common/Card';
import Icon from '../common/Icon';

interface ResourceHubModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
}

const ResourceHubModal: React.FC<ResourceHubModalProps> = ({ isOpen, onClose, patient }) => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    useEffect(() => {
        if (isOpen && patient.resourceIds && patient.resourceIds.length > 0) {
            setIsLoading(true);
            api.getResourcesByIds(patient.resourceIds)
                .then(setResources)
                .catch(err => console.error("Failed to fetch resources", err))
                .finally(() => setIsLoading(false));
        } else {
            setResources([]);
            setIsLoading(false);
        }
    }, [isOpen, patient.resourceIds]);
    
    const handleClose = () => {
        setSelectedResource(null);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={selectedResource ? selectedResource.title : "Resource Hub"} size="xl">
            {isLoading ? (
                <div className="flex justify-center items-center h-48"><Spinner /></div>
            ) : selectedResource ? (
                <div>
                     <button onClick={() => setSelectedResource(null)} className="mb-4 text-sm text-primary-600 font-semibold">&larr; Back to all resources</button>
                     <p className="text-xs uppercase text-gray-500">{selectedResource.type}</p>
                     <div className="prose mt-2 max-w-none">
                        <p>{selectedResource.content}</p>
                     </div>
                </div>
            ) : resources.length > 0 ? (
                <div className="space-y-3">
                    {resources.map(resource => (
                        <Card key={resource.id} className="cursor-pointer hover:shadow-md hover:border-primary-300" onClick={() => setSelectedResource(resource)}>
                           <div className="flex justify-between items-center">
                             <div>
                               <p className="font-bold">{resource.title}</p>
                               <p className="text-sm capitalize text-gray-500">{resource.type}</p>
                             </div>
                             <Icon name={resource.type === 'recipe' ? 'clipboard' : 'book'} className="h-6 w-6 text-gray-400" />
                           </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <p>Your dietician has not assigned any resources to you yet.</p>
            )}
        </Modal>
    );
};

export default ResourceHubModal;