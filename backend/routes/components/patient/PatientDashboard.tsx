import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Patient, ApplicationStatus, Dietician } from '../../types';
import Spinner from '../common/Spinner';
import DieticianList from './DieticianList';
import PatientAcceptedView from './PatientAcceptedView';
import Card from '../common/Card';
import { api } from '../../services/api';

const PatientDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const patient = user as Patient;

  const [dietician, setDietician] = useState<Dietician | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (patient?.applicationStatus === ApplicationStatus.ACCEPTED && patient.assignedDieticianId) {
        try {
          const dieticianData = await api.getUser(patient.assignedDieticianId) as Dietician;
          setDietician(dieticianData);
        } catch (error) {
          console.error("Failed to fetch dietician data", error);
        }
      }
      setDashboardLoading(false);
    };

    if (!authLoading && patient) {
        fetchDashboardData();
    } else {
        setDashboardLoading(false);
    }
  }, [authLoading, patient]);

  if (authLoading || dashboardLoading || !patient) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" color="border-primary-500" /></div>;
  }

  const renderContent = () => {
    switch (patient.applicationStatus) {
      case ApplicationStatus.NONE:
      case ApplicationStatus.REJECTED:
        return <DieticianList />;
      case ApplicationStatus.PENDING:
        return (
          <div className="max-w-2xl mx-auto">
            <Card>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Application Pending</h2>
                <p className="mt-2 text-gray-600">Your application is currently under review by a dietician. You will be notified once a decision has been made.</p>
              </div>
            </Card>
          </div>
        );
      case ApplicationStatus.ACCEPTED:
        return dietician ? <PatientAcceptedView patient={patient} dietician={dietician} /> : <div className="flex justify-center items-center h-64"><Spinner size="lg" color="border-primary-500" /></div>;
      default:
        return <p>An unknown error occurred.</p>;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {patient.name}!</h1>
      {renderContent()}
    </div>
  );
};

export default PatientDashboard;