import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Patient, Dietician } from '../../types';
import Button from '../common/Button';
import { useToast } from '../../hooks/useToast';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    dietician: Dietician;
    onSlotSelected: (dateTime: string) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, patient, dietician, onSlotSelected }) => {
    const { showToast } = useToast();
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const handleProceedToPayment = () => {
        if (!selectedSlot) {
            showToast('Please select a time slot.', 'error');
            return;
        }
        onSlotSelected(selectedSlot);
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
                        onClick={handleProceedToPayment}
                        disabled={!selectedSlot}
                    >
                       Proceed to Payment
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AppointmentModal;