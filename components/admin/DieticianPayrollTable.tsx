import React, { useState, useMemo } from 'react';
import { Dietician, DieticianPayment } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';

interface DieticianPayrollTableProps {
  dieticians: Dietician[];
  payments: DieticianPayment[];
  onPaymentSuccess: () => void;
}

const BASE_SALARY = 30000;
const PERFORMANCE_BONUS = 500;
const PERFORMANCE_THRESHOLD = 6;

const DieticianPayrollTable: React.FC<DieticianPayrollTableProps> = ({ dieticians, payments, onPaymentSuccess }) => {
    const { showToast } = useToast();

    const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const payrollData = useMemo(() => {
        const today = new Date();
        const currentMonthKey = getMonthKey(today);
        
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthKey = getMonthKey(lastMonth);

        return dieticians.map(d => {
            const newPatientsThisMonth = d.acceptedPatientsLog?.filter(log => getMonthKey(new Date(log.date)) === currentMonthKey).length || 0;
            const newPatientsLastMonth = d.acceptedPatientsLog?.filter(log => getMonthKey(new Date(log.date)) === lastMonthKey).length || 0;

            const bonus = newPatientsLastMonth >= PERFORMANCE_THRESHOLD ? PERFORMANCE_BONUS : 0;
            const salary = BASE_SALARY + bonus;

            const hasBeenPaid = payments.some(p => p.dieticianId === d.id && p.forMonth === currentMonthKey);

            return {
                ...d,
                newPatientsThisMonth,
                newPatientsLastMonth,
                bonus,
                salary,
                hasBeenPaid,
            };
        });
    }, [dieticians, payments]);
    
    const [payingId, setPayingId] = useState<string | null>(null);

    const handlePay = async (dietician: typeof payrollData[0]) => {
        setPayingId(dietician.id);
        try {
            const currentMonthKey = getMonthKey(new Date());
            await api.payDietician(dietician.id, dietician.salary, currentMonthKey);
            showToast(`Paid ${dietician.name} ₹${dietician.salary.toLocaleString()}`, 'success');
            onPaymentSuccess();
        } catch(e) {
            showToast('Payment failed.', 'error');
        } finally {
            setPayingId(null);
        }
    }

    return (
        <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dietician Payroll (for {new Date().toLocaleString('default', { month: 'long' })})</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dietician</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Patients (This Mth)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Patients (Last Mth)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Performance Bonus
                                <span className="text-gray-400 ml-1" title={`Bonus for >= ${PERFORMANCE_THRESHOLD} patients in last month`}>?</span>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Salary</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payrollData.length > 0 ? payrollData.map(d => (
                            <tr key={d.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.newPatientsThisMonth}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">{d.newPatientsLastMonth}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{d.bonus.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">₹{d.salary.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${d.hasBeenPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {d.hasBeenPaid ? 'Paid' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button size="sm" onClick={() => handlePay(d)} disabled={d.hasBeenPaid} isLoading={payingId === d.id}>
                                        {d.hasBeenPaid ? 'Paid' : 'Pay Now'}
                                    </Button>
                                </td>
                            </tr>
                        )) : (
                           <tr><td colSpan={7} className="text-center py-8 text-gray-500">No dieticians found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default DieticianPayrollTable;