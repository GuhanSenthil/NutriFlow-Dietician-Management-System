import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Patient, Dietician } from '../../types';
import { api } from '../../services/api';
import Button from '../common/Button';
import Icon from '../common/Icon';
import Spinner from '../common/Spinner';
import QRCode from '../common/QRCode';
import { useToast } from '../../hooks/useToast';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    dietician: Dietician;
    dateTime: string | null;
    onPaymentSuccess: () => void;
}

type PaymentState = 'idle' | 'processing' | 'success';

const APPOINTMENT_FEE = 75;

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, patient, dietician, dateTime, onPaymentSuccess }) => {
    const [paymentState, setPaymentState] = useState<PaymentState>('idle');
    const { showToast } = useToast();

    useEffect(() => {
        // Reset state when modal is reopened
        if (isOpen) {
            setPaymentState('idle');
        }
    }, [isOpen]);

    const handleConfirmPayment = () => {
        setPaymentState('processing');
        
        // Simulate payment verification
        setTimeout(() => {
            if (dateTime) {
                // On successful verification, create payment record and book appointment
                Promise.all([
                    api.addPayment(patient.id, APPOINTMENT_FEE),
                    api.bookAppointment(patient.id, dietician.id, dateTime)
                ]).then(() => {
                    setPaymentState('success');
                    // Automatically close and trigger success after showing the success message
                    setTimeout(() => {
                        onPaymentSuccess();
                    }, 1500);
                }).catch(err => {
                    console.error("Booking/Payment failed", err);
                    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                    showToast(`Payment failed: ${errorMessage}`, 'error');
                    setPaymentState('idle'); // Reset on failure
                });
            }
        }, 2500);
    };

    if (!dateTime) return null;

    const renderContent = () => {
        switch (paymentState) {
            case 'processing':
                return (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <Spinner size="lg" color="border-primary-500" />
                        <p className="text-lg font-semibold text-gray-700">Verifying payment...</p>
                        <p className="text-sm text-gray-500">Please do not close this window.</p>
                    </div>
                );
            case 'success':
                 return (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <Icon name="check" className="h-10 w-10 text-green-600" />
                        </div>
                        <p className="text-xl font-bold text-gray-800">Payment Successful!</p>
                        <p className="text-sm text-gray-600">Your appointment is confirmed.</p>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                             <Icon name="gpay" className="h-8 w-8 text-gray-600 fill-current" />
                             <h3 className="text-xl font-bold text-gray-800">Pay with GPay</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Scan the QR code below with your GPay app to complete the payment for your appointment.</p>
                        
                        <div className="inline-block p-3 bg-white border-4 border-gray-200 rounded-lg">
                            <QRCode size={180} />
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 rounded-md text-left">
                            <p><strong>To:</strong> {dietician.name}</p>
                            <p><strong>For:</strong> {new Date(dateTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                            <p className="text-lg font-bold mt-2"><strong>Amount:</strong> ₹{APPOINTMENT_FEE.toFixed(2)}</p>
                        </div>

                        <Button onClick={handleConfirmPayment} className="w-full mt-6">
                            I have paid
                        </Button>
                    </div>
                );
        }
    }


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Booking" size="md">
            {renderContent()}
        </Modal>
    );
};

export default PaymentModal;