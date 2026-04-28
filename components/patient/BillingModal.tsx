import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Patient, Payment } from '../../types';
import { api } from '../../services/api';
import Spinner from '../common/Spinner';

interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
}

const BillingModal: React.FC<BillingModalProps> = ({ isOpen, onClose, patient }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            api.getPaymentsByPatientId(patient.id)
                .then(data => {
                    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setPayments(sortedData);
                })
                .catch(err => console.error("Failed to fetch payments", err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, patient.id]);

    const getStatusBadge = (status: Payment['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Billing History">
            <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : payments.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(payment.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{payment.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{payment.id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-500 py-8">You have no payment history.</p>
                )}
            </div>
        </Modal>
    );
};

export default BillingModal;