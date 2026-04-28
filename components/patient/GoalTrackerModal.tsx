import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Patient, Goal } from '../../types';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Icon from '../common/Icon';

interface GoalTrackerModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
}

const GoalTrackerModal: React.FC<GoalTrackerModalProps> = ({ isOpen, onClose, patient }) => {
    const { refreshUser } = useAuth();
    const { showToast } = useToast();

    const [newGoal, setNewGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoal.trim()) return;
        setIsLoading(true);
        try {
            await api.addGoal(patient.id, { description: newGoal });
            await refreshUser();
            showToast('New goal added!', 'success');
            setNewGoal('');
        } catch (error) {
            showToast('Failed to add goal.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Track Your Goals">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Current Goals</h3>
                    <ul className="mt-2 space-y-2">
                        {patient.goals && patient.goals.length > 0 ? patient.goals.map((goal: Goal) => (
                            <li key={goal.id} className="flex items-center p-3 bg-gray-50 border rounded-md">
                                <Icon name={goal.completed ? "check" : "goal"} className={`h-5 w-5 mr-3 ${goal.completed ? 'text-green-500' : 'text-gray-400'}`} />
                                <span className={`${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{goal.description}</span>
                            </li>
                        )) : <p className="text-sm text-gray-500">No goals set yet. Add one below!</p>}
                    </ul>
                </div>
                
                <form onSubmit={handleAddGoal} className="pt-4 border-t">
                     <label htmlFor="new-goal" className="block text-sm font-medium text-gray-700">Add a New Goal</label>
                     <div className="mt-1 flex">
                        <input 
                            type="text" 
                            id="new-goal"
                            value={newGoal}
                            onChange={e => setNewGoal(e.target.value)}
                            className="flex-grow block w-full rounded-none rounded-l-md border-gray-300 shadow-sm"
                            placeholder="e.g., Walk 30 minutes daily"
                        />
                        <Button type="submit" isLoading={isLoading} className="rounded-l-none">Add Goal</Button>
                     </div>
                </form>
            </div>
        </Modal>
    );
};

export default GoalTrackerModal;