import React, { useState, useEffect } from 'react';
// FIX: Added MealType to the import list for strong typing.
import { DietPlan, Patient, Resource, Dietician, SymptomLogEntry, FoodDiaryEntry, Goal, MealType } from '../../types';
import Card from '../common/Card';
import Icon from '../common/Icon';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../common/Modal';
import { useChat } from '../../hooks/useChat';
import CreateResourceModal from './CreateResourceModal';

interface PatientDetailViewProps {
  patient: Patient;
  onPatientUpdate: (patient: Patient) => void;
}

type Tab = 'overview' | 'foodDiary' | 'symptoms' | 'goals' | 'messages' | 'resources';

const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patient, onPatientUpdate }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    
    const calculateBMI = () => {
        const { height, weight } = patient.profile;
        if (height && weight) {
            return (weight / ((height / 100) ** 2)).toFixed(1);
        }
        return 'N/A';
    };

    const tabs: { id: Tab, name: string, icon: string }[] = [
        { id: 'overview', name: 'Overview', icon: 'clipboard' },
        { id: 'foodDiary', name: 'Food Diary', icon: 'book' },
        { id: 'symptoms', name: 'Symptoms', icon: 'symptom' },
        { id: 'goals', name: 'Goals', icon: 'goal' },
        { id: 'messages', name: 'Messages', icon: 'send' },
        { id: 'resources', name: 'Resources', icon: 'book' },
    ];

    const TabContent: React.FC = () => {
        switch(activeTab) {
            case 'overview': return <OverviewTab patient={patient} onPatientUpdate={onPatientUpdate} />;
            case 'foodDiary': return <FoodDiaryTab patient={patient} />;
            case 'symptoms': return <SymptomsTab patient={patient} />;
            case 'goals': return <GoalsTab patient={patient} />;
            case 'messages': return <MessagesTab patient={patient} />;
            case 'resources': return <ResourcesTab patient={patient} onPatientUpdate={onPatientUpdate} />;
            default: return null;
        }
    };
    
    return (
        <Card className="p-0 transition-all duration-300 animate-fade-in">
            <div className="p-4 border-b">
                <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                <div className="flex space-x-6 mt-2 text-sm text-gray-600">
                    <span><strong>Age:</strong> {patient.profile.age || 'N/A'}</span>
                    <span><strong>Weight:</strong> {patient.profile.weight || 'N/A'} kg</span>
                    <span><strong>Height:</strong> {patient.profile.height || 'N/A'} cm</span>
                    <span><strong>BMI:</strong> {calculateBMI()}</span>
                </div>
            </div>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 px-4 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
                        >
                          <Icon name={tab.icon} className="h-5 w-5 mr-2" />
                          {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="p-4 bg-gray-50/50">
                <TabContent />
            </div>
        </Card>
    );
};


const OverviewTab: React.FC<PatientDetailViewProps> = ({ patient, onPatientUpdate }) => {
    const { showToast } = useToast();
    const [dietPlan, setDietPlan] = useState<DietPlan>(patient.dietPlan || {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setDietPlan(patient.dietPlan || {});
    }, [patient]);

    // FIX: Changed 'meal' parameter type from 'string' to 'MealType' for type safety.
    const handleDietPlanChange = (date: string, meal: MealType, value: string) => {
        setDietPlan(prev => ({
            ...prev,
            [date]: {
                ...prev[date],
                [meal]: value,
            }
        }));
    };
    
    const saveDietPlan = async () => {
        setIsSaving(true);
        try {
            await api.updatePatientDietPlan(patient.id, dietPlan);
            onPatientUpdate({...patient, dietPlan});
            showToast("Diet plan saved!", "success");
        } catch (error) {
            showToast("Failed to save diet plan.", "error");
        } finally {
            setIsSaving(false);
        }
    };
    
    const getCurrentWeekDates = () => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Monday
        return Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            return date.toISOString().split('T')[0];
        });
    };

    return (
        <div className="space-y-6">
            <Card title="Diet Plan Editor">
                 <div className="space-y-4">
                    {getCurrentWeekDates().map(date => (
                        <div key={date}>
                            <h4 className="font-semibold text-gray-700">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {/* FIX: Iterating over MealType enum values and casting to MealType[] to resolve incorrect type inference. */}
                                {(Object.values(MealType) as MealType[]).map(meal => (
                                    <input 
                                        key={meal}
                                        type="text"
                                        placeholder={meal}
                                        value={dietPlan[date]?.[meal] || ''}
                                        onChange={(e) => handleDietPlanChange(date, meal, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={saveDietPlan} isLoading={isSaving}>Save Diet Plan</Button>
                </div>
            </Card>
            <Card title="Dietician Notes (Private)">
                <textarea rows={4} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Log observations, thoughts, and plans for this patient..."></textarea>
            </Card>
        </div>
    );
};

const FoodDiaryTab: React.FC<{ patient: Patient }> = ({ patient }) => {
    const foodDiary = [...(patient.foodDiary || [])].sort((a, b) => b.date.localeCompare(a.date));

    if (foodDiary.length === 0) {
        return <Card title="Food Diary"><p className="text-gray-500">The patient has not logged any meals yet.</p></Card>;
    }

    return (
        <Card title="Food Diary Log">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {foodDiary.map((entry: FoodDiaryEntry) => (
                    <div key={entry.id} className="p-3 bg-white border rounded-md">
                        <h4 className="font-semibold text-gray-800">{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                        <ul className="mt-2 space-y-1 text-sm">
                            {Object.entries(entry.meals).map(([mealType, description]) => (
                                <li key={mealType}>
                                    {/* FIX: Cast description to string as TypeScript infers it as unknown, which cannot be rendered. */}
                                    <strong className="text-gray-600">{mealType}:</strong> {description as string}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const GoalsTab: React.FC<{ patient: Patient }> = ({ patient }) => {
    const goals = patient.goals || [];

    if (goals.length === 0) {
        return <Card title="Patient Goals"><p className="text-gray-500">The patient has not set any goals yet.</p></Card>;
    }

    return (
        <Card title="Patient Goals">
            <ul className="space-y-3">
                {goals.map((goal: Goal) => (
                    <li key={goal.id} className="flex items-center p-3 bg-white border rounded-md">
                        <Icon name={goal.completed ? "check" : "goal"} className={`h-5 w-5 mr-3 ${goal.completed ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={`${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{goal.description}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

const SymptomsTab: React.FC<{ patient: Patient }> = ({ patient }) => {
    const symptoms = [...(patient.symptomLog || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (symptoms.length === 0) {
        return (
            <Card title="Symptom Log">
                <p className="text-gray-500">The patient has not logged any symptoms yet.</p>
            </Card>
        );
    }
    
    const SeverityStars: React.FC<{ rating: number }> = ({ rating }) => (
        <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );

    return (
        <Card title="Symptom Log">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {symptoms.map((log: SymptomLogEntry) => (
                    <div key={log.id} className="p-3 bg-white border rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-gray-800">{log.symptom}</p>
                                <p className="text-xs text-gray-500">{new Date(log.date).toLocaleString()}</p>
                            </div>
                            <SeverityStars rating={log.severity} />
                        </div>
                        {log.notes && <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">Notes: {log.notes}</p>}
                    </div>
                ))}
            </div>
        </Card>
    );
};


const MessagesTab: React.FC<{patient: Patient}> = ({ patient }) => {
    const { user: dietician } = useAuth();
    const chatId = [dietician!.id, patient.id].sort().join('_');
    const { messages, sendMessage } = useChat(chatId);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (newMessage.trim()) {
            sendMessage(newMessage, dietician!.id, patient.id);
            setNewMessage('');
        }
    };

    return (
        <Card title={`Chat with ${patient.name}`} className="p-0 flex flex-col h-[60vh]">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === dietician!.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.senderId === dietician!.id ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t flex">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
                    placeholder="Type a message..."
                />
                <Button onClick={handleSend} className="rounded-l-none">Send</Button>
            </div>
        </Card>
    );
};

const ResourcesTab: React.FC<PatientDetailViewProps> = ({ patient, onPatientUpdate }) => {
    const { user, refreshUser } = useAuth();
    const dietician = user as Dietician;
    const { showToast } = useToast();
    const [assignedResources, setAssignedResources] = useState<Resource[]>([]);
    const [allResources, setAllResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchResources = async () => {
        setIsLoading(true);
        const [assigned, all] = await Promise.all([
            api.getResourcesByIds(patient.resourceIds || []),
            api.getResourcesByIds(dietician?.resourceIds || [])
        ]);
        setAssignedResources(assigned);
        setAllResources(all);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchResources();
    }, [patient, dietician]);
    
    const handleToggleAssign = async (resource: Resource) => {
        const isAssigned = assignedResources.some(r => r.id === resource.id);
        try {
            if (isAssigned) {
                await api.unassignResourceFromPatient(patient.id, resource.id);
            } else {
                await api.assignResourceToPatient(patient.id, resource.id);
            }
            const updatedPatient = await api.getUser(patient.id) as Patient;
            onPatientUpdate(updatedPatient);
            fetchResources(); // Re-fetch all to update state
            showToast(`Resource ${isAssigned ? 'unassigned' : 'assigned'}.`, 'success');
        } catch (error) {
            showToast('Failed to update resource assignment.', 'error');
        }
    };
    
    const onResourceCreated = async () => {
        await refreshUser(); // This updates the dietician's resourceIds in the AuthContext
        fetchResources(); // This re-fetches based on the new data
    };

    return (
        <div className="space-y-6">
            <Card title="Assigned Resources" actions={<div className="flex space-x-2"><Button onClick={() => setIsCreateModalOpen(true)}>Create New</Button><Button onClick={() => setIsManageModalOpen(true)}>Manage</Button></div>}>
                 {isLoading ? <p>Loading...</p> : assignedResources.length > 0 ? (
                    <ul className="space-y-2">
                        {assignedResources.map(r => (
                            <li key={r.id} className="p-2 bg-gray-100 rounded">{r.title}</li>
                        ))}
                    </ul>
                ) : <p>No resources assigned yet.</p>}
            </Card>

            <Modal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} title="Manage Resources">
                <p className="text-sm text-gray-600 mb-4">Select resources to assign or unassign for {patient.name}.</p>
                <div className="max-h-96 overflow-y-auto space-y-2">
                    {allResources.map(resource => (
                        <div key={resource.id} className="flex items-center justify-between p-3 border rounded-md">
                           <div>
                             <p className="font-semibold">{resource.title}</p>
                             <p className="text-xs capitalize text-gray-500">{resource.type}</p>
                           </div>
                           <Button size="sm" onClick={() => handleToggleAssign(resource)}>
                               {assignedResources.some(r => r.id === resource.id) ? 'Unassign' : 'Assign'}
                           </Button>
                        </div>
                    ))}
                </div>
            </Modal>

            <CreateResourceModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onResourceCreated={onResourceCreated}
            />
        </div>
    );
};

export default PatientDetailView;