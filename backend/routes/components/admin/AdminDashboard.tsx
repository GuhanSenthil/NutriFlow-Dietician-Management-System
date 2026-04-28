import React, { useState, useEffect, useMemo } from 'react';
import { AppUser, Role, User, Patient } from '../../types';
import { api } from '../../services/api';
import StatCard from '../common/StatCard';
import Icon from '../common/Icon';
import PlatformChart from './PlatformChart';
import UserManagementTable from './UserManagementTable';
import Card from '../common/Card';
import Button from '../common/Button';
import { useToast } from '../../hooks/useToast';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ patients: 0, dieticians: 0 });
    const [patients, setPatients] = useState<Patient[]>([]);
    const [dieticians, setDieticians] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState<Role.PATIENT | Role.DIETICIAN>(Role.PATIENT);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const { showToast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        const [patientsData, dieticiansData] = await Promise.all([
            api.getUsersByRole(Role.PATIENT) as Promise<Patient[]>,
            api.getUsersByRole(Role.DIETICIAN),
        ]);
        
        setPatients(patientsData);
        setDieticians(dieticiansData);
        setStats({ 
            patients: patientsData.length, 
            dieticians: dieticiansData.length,
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!broadcastMessage.trim()) {
            showToast('Broadcast message cannot be empty.', 'error');
            return;
        }
        setIsBroadcasting(true);
        try {
            await api.sendBroadcast(broadcastMessage, broadcastTarget);
            showToast('Broadcast sent successfully!', 'success');
            setBroadcastMessage('');
        } catch (error) {
            showToast('Failed to send broadcast.', 'error');
        } finally {
            setIsBroadcasting(false);
        }
    };
    
    const handleUserUpdate = (updatedUser: User) => {
        const updateUserList = (list: AppUser[]) => 
            list.map(u => u.id === updatedUser.id ? {...u, ...updatedUser} : u);

        if (updatedUser.role === Role.PATIENT) {
            setPatients(prev => updateUserList(prev) as Patient[]);
        } else if (updatedUser.role === Role.DIETICIAN) {
            setDieticians(updateUserList);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Patients" value={stats.patients} icon={<Icon name="users" className="h-6 w-6 text-primary-600"/>} />
                <StatCard title="Total Dieticians" value={stats.dieticians} icon={<Icon name="user" className="h-6 w-6 text-primary-600"/>}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Platform Growth" icon={<Icon name="chart" className="h-5 w-5 text-gray-600"/>}>
                        <div style={{height: '300px'}}>
                            <PlatformChart patients={patients} dieticians={dieticians} />
                        </div>
                    </Card>
                </div>
                <div>
                    <Card title="Broadcast Message" icon={<Icon name="send" className="h-5 w-5 text-gray-600"/>}>
                        <form onSubmit={handleBroadcast} className="space-y-4">
                            <div>
                                <label htmlFor="broadcast-message" className="block text-sm font-medium text-gray-700">Message</label>
                                <textarea 
                                    id="broadcast-message" 
                                    rows={4}
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="Announce a new feature or update..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                                <div className="mt-2 flex space-x-4">
                                    <div className="flex items-center">
                                        <input id="target-patients" type="radio" name="target" value={Role.PATIENT} checked={broadcastTarget === Role.PATIENT} onChange={() => setBroadcastTarget(Role.PATIENT)} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"/>
                                        <label htmlFor="target-patients" className="ml-2 block text-sm text-gray-900">Patients</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="target-dieticians" type="radio" name="target" value={Role.DIETICIAN} checked={broadcastTarget === Role.DIETICIAN} onChange={() => setBroadcastTarget(Role.DIETICIAN)} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"/>
                                        <label htmlFor="target-dieticians" className="ml-2 block text-sm text-gray-900">Dieticians</label>
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" isLoading={isBroadcasting} className="w-full">
                                Send Broadcast
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
            
            <div className="space-y-6">
                <UserManagementTable title="Dietician Management" users={dieticians} onUserUpdate={handleUserUpdate} isLoading={loading} />
                <UserManagementTable title="Patient Management" users={patients} onUserUpdate={handleUserUpdate} isLoading={loading} />
            </div>
        </div>
    );
};

export default AdminDashboard;