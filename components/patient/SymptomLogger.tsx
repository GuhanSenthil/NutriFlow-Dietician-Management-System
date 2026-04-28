import React, { useState } from 'react';
import Card from '../common/Card';
import Icon from '../common/Icon';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

interface SymptomLoggerProps {
    patientId: string;
}

const SymptomLogger: React.FC<SymptomLoggerProps> = ({ patientId }) => {
    const { showToast } = useToast();
    const { refreshUser } = useAuth();
    const [symptom, setSymptom] = useState('');
    const [severity, setSeverity] = useState(0);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symptom.trim() || severity === 0) {
            showToast('Please enter a symptom and select a severity.', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await api.addSymptomLog(patientId, { symptom, severity, notes });
            await refreshUser();
            showToast('Symptom logged successfully!', 'success');
            // Reset form
            setSymptom('');
            setSeverity(0);
            setNotes('');
        } catch (error) {
            showToast('Failed to log symptom.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const SeverityPicker: React.FC = () => (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setSeverity(star)}
                    className="focus:outline-none"
                >
                    <svg
                        className={`h-6 w-6 ${severity >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );

    return (
        <Card title="Log a Symptom" icon={<Icon name="symptom" className="h-5 w-5"/>}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="symptom" className="block text-sm font-medium text-gray-700">Symptom</label>
                    <input type="text" id="symptom" value={symptom} onChange={e => setSymptom(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="e.g., Headache, Bloating..." />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700">Severity</label>
                     <SeverityPicker />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                    <textarea id="notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Any additional details..."></textarea>
                </div>
                <div className="text-right">
                    <Button type="submit" isLoading={isLoading}>Log Symptom</Button>
                </div>
            </form>
        </Card>
    );
};

export default SymptomLogger;