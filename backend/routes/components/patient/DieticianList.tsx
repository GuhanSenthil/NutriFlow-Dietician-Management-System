
import React, { useState, useEffect } from 'react';
import { Dietician, Patient } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';

const DieticianList: React.FC = () => {
    const [dieticians, setDieticians] = useState<Dietician[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDietician, setSelectedDietician] = useState<Dietician | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    const { user, setUser } = useAuth();
    const { showToast } = useToast();
    const patient = user as Patient;

    useEffect(() => {
        const fetchDieticians = async () => {
            setLoading(true);
            try {
                const data = await api.getDieticians();
                setDieticians(data);
            } catch (error) {
                showToast('Failed to load dieticians.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchDieticians();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApply = async (dieticianId: string) => {
        setIsApplying(true);
        try {
            await api.applyToDietician(patient.id, dieticianId);
            const updatedPatient = await api.getUser(patient.id) as Patient;
            setUser(updatedPatient);
            showToast('Application sent successfully!', 'success');
        } catch (error) {
            showToast('Failed to send application.', 'error');
        } finally {
            setIsApplying(false);
            setSelectedDietician(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center"><Spinner size="lg" color="border-primary-500" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Find Your Dietician</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dieticians.map(dietician => (
                    <Card key={dietician.id}>
                        <h3 className="text-xl font-bold">{dietician.name}</h3>
                        <p className="text-primary-600 font-medium">{dietician.specialization}</p>
                        <p className="text-gray-600 mt-2 text-sm">{dietician.bio}</p>
                        <div className="mt-4 flex space-x-2">
                            <Button onClick={() => setSelectedDietician(dietician)}>View Profile</Button>
                            <Button variant="secondary" isLoading={isApplying && selectedDietician?.id === dietician.id} onClick={() => handleApply(dietician.id)}>Apply</Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={!!selectedDietician} onClose={() => setSelectedDietician(null)} title={selectedDietician?.name || ''}>
                {selectedDietician && (
                    <div className="space-y-4">
                        <p className="text-lg font-semibold text-primary-600">{selectedDietician.specialization}</p>
                        <p>{selectedDietician.bio}</p>
                        <p className="text-sm text-gray-500">Contact: {selectedDietician.email}</p>
                        <div className="flex justify-end pt-4">
                            <Button
                                isLoading={isApplying}
                                onClick={() => handleApply(selectedDietician.id)}
                            >
                                Apply to {selectedDietician.name}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DieticianList;
