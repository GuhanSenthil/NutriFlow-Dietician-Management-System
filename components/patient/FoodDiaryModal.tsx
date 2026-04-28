import React, { useState } from 'react';
import Modal from '../common/Modal';
import { MealType } from '../../types';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

interface FoodDiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
}

const FoodDiaryModal: React.FC<FoodDiaryModalProps> = ({ isOpen, onClose, patientId }) => {
    const { refreshUser } = useAuth();
    const { showToast } = useToast();
    
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [meals, setMeals] = useState({
        [MealType.BREAKFAST]: '',
        [MealType.LUNCH]: '',
        [MealType.DINNER]: '',
        [MealType.SNACK]: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleMealChange = (mealType: MealType, value: string) => {
        setMeals(prev => ({ ...prev, [mealType]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.addFoodDiaryEntry(patientId, { date, meals });
            await refreshUser();
            showToast('Food diary updated!', 'success');
            onClose();
        } catch (error) {
            showToast('Failed to save food diary.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Your Meals">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" name="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>

                {(Object.values(MealType) as MealType[]).map(mealType => (
                    <div key={mealType}>
                        <label htmlFor={mealType} className="block text-sm font-medium text-gray-700">{mealType}</label>
                        <textarea 
                            id={mealType}
                            rows={2}
                            value={meals[mealType]}
                            onChange={e => handleMealChange(mealType, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            placeholder={`What did you have for ${mealType.toLowerCase()}?`}
                        />
                    </div>
                ))}

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Save Diary</Button>
                </div>
            </form>
        </Modal>
    );
};

export default FoodDiaryModal;