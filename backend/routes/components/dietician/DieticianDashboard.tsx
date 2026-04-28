import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { Dietician, Patient, Appointment } from '../../../../types';
import { api } from '../../../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import PatientDetailView from './PatientDetailView';
import EmptyState from '../common/EmptyState';
import { useToast } from '../../../../hooks/useToast';
import Icon from '../common/Icon';
import EditDieticianProfileModal from './EditDieticianProfileModal';

const PatientListSkeleton: React.FC = () => (
    <li className="p-4">
        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
    </li>
);

const DieticianDashboard: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const dietician = user as Dietician;
    const { showToast } = useToast();

    const [pendingPatients, setPendingPatients] = useState<Patient[]>([]);
    const [acceptedPatients, setAcceptedPatients] = useState<Patient[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        if (dietician) {
            // FIX: The 'Dietician' type has 'acceptedPatientsLog' (an array of objects) instead of 'acceptedPatientIds'. We need to map over it to get the patient IDs.
            const acceptedPatientIds = dietician.acceptedPatientsLog.map(log => log.patientId);
            const allPatientIds = [...dietician.pendingPatientIds, ...acceptedPatientIds];
            
            const [appointmentData, allPatients] = await Promise.all([
                api.getAppointments(dietician.id),
                allPatientIds.length > 0 ? api.getUsersByIds(allPatientIds) as Promise<Patient[]> : Promise.resolve([])
            ]);
            
            const pending = allPatients.filter(p => dietician.pendingPatientIds.includes(p.id));
            // FIX: Use the derived 'acceptedPatientIds' array for filtering.
            const accepted = allPatients.filter(p => acceptedPatientIds.includes(p.id));
            
            setAppointments(appointmentData);
            setPendingPatients(pending);
            setAcceptedPatients(accepted);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleApplication = async (patientId: string, action: 'accept' | 'reject') => {
        try {
            await api.handleApplication(dietician.id, patientId, action);
            await refreshUser(); // This will fetch the latest dietician data for the context
            showToast(`Application ${action}ed.`, 'success');
        } catch (error) {
            showToast('Failed to process application.', 'error');
        }
    };
    
    const filteredAcceptedPatients = useMemo(() => {
        return acceptedPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [acceptedPatients, searchTerm]);
    
    const handlePatientUpdate = (updatedPatient: Patient) => {
        setAcceptedPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        if (selectedPatient?.id === updatedPatient.id) {
            setSelectedPatient(updatedPatient);
        }
    };

    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
                 <Card 
                    title="My Profile" 
                    icon={<Icon name="user" className="h-5 w-5 text-gray-600"/>} 
                    actions={<Button variant="ghost" size="sm" onClick={() => setIsProfileModalOpen(true)}>Edit</Button>}
                >
                    <p className="font-bold text-lg text-gray-800">{dietician.name}</p>
                    <p className="text-sm font-medium text-primary-600">{dietician.specialization}</p>
                    <p className="mt-2 text-sm text-gray-600">{dietician.bio}</p>
                </Card>

                <Card title={`Pending Applications (${pendingPatients.length})`}>
                    {pendingPatients.length > 0 ? (
                        <ul className="space-y-3">
                            {pendingPatients.map(patient => (
                                <li key={patient.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                                    <span className="font-medium">{patient.name}</span>
                                    <div className="space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleApplication(patient.id, 'accept')}>Accept</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleApplication(patient.id, 'reject')}>Reject</Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No pending applications.</p>
                    )}
                </Card>

                <Card>
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold">My Patients ({filteredAcceptedPatients.length})</h3>
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <PatientListSkeleton key={i} />)
                        ) : filteredAcceptedPatients.length > 0 ? filteredAcceptedPatients.map(patient => (
                            <li 
                                key={patient.id}
                                onClick={() => setSelectedPatient(patient)}
                                className={`p-4 cursor-pointer hover:bg-primary-50 ${selectedPatient?.id === patient.id ? 'bg-primary-100' : ''}`}
                            >
                                <p className="font-semibold text-gray-800">{patient.name}</p>
                                <p className="text-sm text-gray-500">{patient.email}</p>
                            </li>
                        )) : (
                        <div className="p-4 text-center text-sm text-gray-500">No patients found.</div>
                        )}
                    </ul>
                </Card>
                
                <Card title="Upcoming Appointments">
                    {appointments.length > 0 ? (
                        <ul className="space-y-2">
                            {appointments.map(app => (
                                <li key={app.id} className="text-sm p-2 bg-gray-50 rounded">
                                    <span className="font-semibold">{app.patientName}</span> at {new Date(app.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyState iconName="calendar" message="No upcoming appointments" />
                    )}
                </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
                {selectedPatient ? (
                    <PatientDetailView patient={selectedPatient} onPatientUpdate={handlePatientUpdate} />
                ) : (
                    <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
                        <EmptyState iconName="user" message="Select a Patient" description="Choose a patient from the list to view their details."/>
                    </div>
                )}
            </div>
        </div>
        <EditDieticianProfileModal 
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            dietician={dietician}
        />
        </>
    );
};

export default DieticianDashboard;