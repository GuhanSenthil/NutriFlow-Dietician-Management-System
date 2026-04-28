import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Patient, Dietician } from '../../types';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Spinner from '../common/Spinner';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    dietician: Dietician;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, patient, dietician }) => {
    const { refreshUser } = useAuth();
    const { showToast } = useToast();
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleBookAppointment = async () => {
        if (!selectedSlot) {
            showToast('Please select a time slot.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await api.bookAppointment(patient.id, dietician.id, selectedSlot);
            // We need to refresh the dietician user in the auth context if they are the one logged in
            // but here the patient is logged in. A global state refresh for appointments might be better.
            // For now, a simple success message is fine.
            showToast('Appointment booked successfully!', 'success');
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to book appointment.';
            showToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Book Appointment with ${dietician.name}`}>
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Available Slots</h3>
                {!dietician.availableSlots || dietician.availableSlots.length === 0 ? (
                    <p className="text-gray-500">This dietician has no available slots at the moment.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {dietician.availableSlots.map(slot => (
                            <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-2 rounded-md text-sm border ${selectedSlot === slot ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-100 hover:bg-gray-200 border-gray-200'}`}
                            >
                                {new Date(slot).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                <br />
                                {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        isLoading={isLoading} 
                        onClick={handleBookAppointment}
                        disabled={!selectedSlot || isLoading}
                    >
                       Confirm Booking
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AppointmentModal;