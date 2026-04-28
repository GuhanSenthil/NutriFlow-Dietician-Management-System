import React, { useState, useEffect } from 'react';
import { Dietician, Patient, ProgressLogEntry } from '../../../../types';
import { api } from '../../../../services/api';
import Card from '../common/Card';
import Icon from '../common/Icon';
import Button from '../common/Button';
import ProgressChart from './ProgressChart';
import Modal from '../common/Modal';
import { useToast } from '../../../../hooks/useToast';
import ChatModal from './ChatModal';
import { useAuth } from '../../../../hooks/useAuth';
import SymptomLogger from './SymptomLogger';
import EditProfileModal from './EditProfileModal';
import ResourceHubModal from './ResourceHubModal';
import FoodDiaryModal from './FoodDiaryModal';
import GoalTrackerModal from './GoalTrackerModal';
import AppointmentModal from './AppointmentModal';
import BMICard from './BMICard';

interface PatientAcceptedViewProps {
    patient: Patient;
    dietician: Dietician;
}

const PatientAcceptedView: React.FC<PatientAcceptedViewProps> = ({ patient, dietician }) => {
    const { showToast } = useToast();
    const { refreshUser } = useAuth();
    
    const [waterCount, setWaterCount] = useState(0);
    const WATER_GOAL = 8;
    
    const [loginStreak, setLoginStreak] = useState(0);

    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isResourceHubModalOpen, setIsResourceHubModalOpen] = useState(false);
    const [isFoodDiaryModalOpen, setIsFoodDiaryModalOpen] = useState(false);
    const [isGoalTrackerModalOpen, setIsGoalTrackerModalOpen] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

    const [newWeight, setNewWeight] = useState<string>('');
    const [isLoggingProgress, setIsLoggingProgress] = useState(false);

    useEffect(() => {
        const today = new Date().toDateString();
        const lastLogin = localStorage.getItem('nutriflow_last_login');
        const currentStreak = parseInt(localStorage.getItem('nutriflow_streak') || '0', 10);

        if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const newStreak = lastLogin === yesterday.toDateString() ? currentStreak + 1 : 1;
            setLoginStreak(newStreak);
            localStorage.setItem('nutriflow_streak', newStreak.toString());
            if (newStreak > 1) {
                showToast(`You're on a ${newStreak}-day streak! Keep it up!`, 'info', 4000);
            }
            localStorage.setItem('nutriflow_last_login', today);
        } else {
            setLoginStreak(currentStreak);
        }
    }, [showToast]);

    const handleLogProgress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWeight || isNaN(parseFloat(newWeight))) {
            showToast("Please enter a valid weight.", "error");
            return;
        }
        setIsLoggingProgress(true);
        const entry: Omit<ProgressLogEntry, 'id'> = {
            date: new Date().toISOString(),
            weight: parseFloat(newWeight)
        };
        try {
            await api.addProgressLog(patient.id, entry);
            await refreshUser(); // Fetch fresh user data
            showToast("Progress logged!", "success");
            setNewWeight('');
            setIsProgressModalOpen(false);
        } catch (error) {
            showToast("Failed to log progress.", "error");
        } finally {
            setIsLoggingProgress(false);
        }
    };

    const handleWaterIncrement = () => {
        const newCount = waterCount + 1;
        setWaterCount(newCount);
        if (newCount === WATER_GOAL) {
            showToast("Great job! You've reached your water goal for today!", 'success', 4000);
        }
    };

    const tools = [
        { name: 'Log Food Diary', icon: 'book', action: () => setIsFoodDiaryModalOpen(true) },
        { name: 'Track Goals', icon: 'goal', action: () => setIsGoalTrackerModalOpen(true) },
        { name: 'Message Dietician', icon: 'send', action: () => setIsChatModalOpen(true) },
        { name: 'Resource Hub', icon: 'clipboard', action: () => setIsResourceHubModalOpen(true) },
        { name: 'Book Appointment', icon: 'calendar', action: () => setIsAppointmentModalOpen(true) },
        { name: 'Community Hub', icon: 'users', action: () => showToast('Feature coming soon!', 'info') },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
                <Card title="Progress Log" icon={<Icon name="chart" className="h-5 w-5"/>} actions={<Button onClick={() => setIsProgressModalOpen(true)}>Log Weight</Button>}>
                    <div className="h-64">
                       <ProgressChart data={patient.progressLog || []} />
                    </div>
                </Card>

                <Card title="Tools & Resources">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {tools.map(tool => (
                             <div key={tool.name} onClick={tool.action} className="group flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg cursor-pointer border-2 border-transparent hover:border-primary-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                 <div className="bg-primary-100 p-3 rounded-full group-hover:bg-primary-500 transition-colors">
                                    <Icon name={tool.icon} className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors" />
                                 </div>
                                <p className="mt-2 text-sm font-semibold text-gray-700 text-center">{tool.name}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <SymptomLogger patientId={patient.id} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                <BMICard 
                    weight={patient.profile.weight} 
                    height={patient.profile.height} 
                    onEdit={() => setIsEditProfileModalOpen(true)}
                />

                <Card>
                    <h3 className="font-bold text-lg">Assigned Dietician</h3>
                    <div className="mt-2 flex items-center space-x-3">
                        <div className="bg-gray-200 p-2 rounded-full">
                           <Icon name="user" className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{dietician?.name || 'Not Assigned'}</p>
                            {dietician && <p className="text-sm text-primary-600">{dietician.specialization}</p>}
                        </div>
                    </div>
                </Card>

                <Card title="Water Tracker" icon={<Icon name="droplet" className="h-5 w-5"/>}>
                    <div className="text-center mb-2">
                        <span className="text-2xl font-bold">{waterCount}</span>
                        <span className="text-gray-500"> / {WATER_GOAL} glasses</span>
                    </div>
                    <div className="flex justify-center w-full gap-2 mb-4">
                        {Array.from({ length: WATER_GOAL }).map((_, i) => (
                             <div key={i} className={`h-8 flex-1 rounded ${i < waterCount ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                        <Button onClick={() => setWaterCount(c => Math.max(0, c - 1))} disabled={waterCount === 0}>-</Button>
                        <Button onClick={handleWaterIncrement} disabled={waterCount >= WATER_GOAL}>+</Button>
                    </div>
                </Card>

                 <Card title="Achievements">
                     <div className="flex items-center justify-center space-x-2">
                        <span role="img" aria-label="fire" className="text-2xl">🔥</span>
                        <p className="text-lg"><strong>{loginStreak}</strong> Day Streak</p>
                     </div>
                 </Card>
            </div>
            
            <Modal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} title="Log Your Weight">
                <form onSubmit={handleLogProgress}>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Today's Weight (kg)</label>
                    <input 
                        type="number"
                        id="weight"
                        step="0.1"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="e.g., 70.5"
                    />
                    <div className="mt-4 flex justify-end">
                        <Button type="submit" isLoading={isLoggingProgress}>Save Log</Button>
                    </div>
                </form>
            </Modal>
            
            {dietician && (
                <ChatModal 
                    isOpen={isChatModalOpen} 
                    onClose={() => setIsChatModalOpen(false)} 
                    patient={patient}
                    dietician={dietician}
                />
            )}

            <EditProfileModal
                isOpen={isEditProfileModalOpen}
                onClose={() => setIsEditProfileModalOpen(false)}
                patient={patient}
            />

            <ResourceHubModal
                isOpen={isResourceHubModalOpen}
                onClose={() => setIsResourceHubModalOpen(false)}
                patient={patient}
            />

            <FoodDiaryModal 
                isOpen={isFoodDiaryModalOpen}
                onClose={() => setIsFoodDiaryModalOpen(false)}
                patientId={patient.id}
            />

            <GoalTrackerModal 
                isOpen={isGoalTrackerModalOpen}
                onClose={() => setIsGoalTrackerModalOpen(false)}
                patient={patient}
            />

            {dietician && (
                <AppointmentModal
                    isOpen={isAppointmentModalOpen}
                    onClose={() => setIsAppointmentModalOpen(false)}
                    patient={patient}
                    dietician={dietician}
                />
            )}
        </div>
    );
};

export default PatientAcceptedView;