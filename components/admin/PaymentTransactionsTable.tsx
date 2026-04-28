import React, { useState, useMemo } from 'react';
import { Payment, Patient } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';

interface PaymentTransactionsTableProps {
  payments: Payment[];
  patients: Patient[];
  isLoading: boolean;
}

const SkeletonRow: React.FC = () => (
    <tr>
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
        <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div></td>
    </tr>
);

const PaymentTransactionsTable: React.FC<PaymentTransactionsTableProps> = ({ payments, patients, isLoading }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const PAYMENTS_PER_PAGE = 5;

    const patientMap = useMemo(() => new Map(patients.map(p => [p.id, p.name])), [patients]);

    const sortedPayments = useMemo(() => {
        return [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [payments]);

    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * PAYMENTS_PER_PAGE;
        return sortedPayments.slice(startIndex, startIndex + PAYMENTS_PER_PAGE);
    }, [sortedPayments, currentPage]);

    const totalPages = Math.ceil(sortedPayments.length / PAYMENTS_PER_PAGE);

    const getStatusBadge = (status: Payment['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Transactions</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : paginatedPayments.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500">No transactions found.</td></tr>
                        ) : (
                            paginatedPayments.map(payment => (
                                <tr key={payment.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{payment.id.split('-')[0]}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patientMap.get(payment.patientId) || 'Unknown Patient'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{payment.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                                            {payment.status}
                                        </span>
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
    );
};

export default PaymentTransactionsTable;