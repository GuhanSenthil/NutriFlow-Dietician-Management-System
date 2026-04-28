import React from 'react';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/common/Navbar';
import Spinner from './components/common/Spinner';
import LoginPage from './components/auth/LoginPage';
import PatientDashboard from './components/patient/PatientDashboard';
import DieticianDashboard from './components/dietician/DieticianDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { Role } from './types';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  const renderDashboard = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-screen"><Spinner size="lg" color="border-primary-500" /></div>;
    }

    if (!user) {
      return <LoginPage />;
    }
    
    if (user.status === 'deactivated') {
        return (
             <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="p-8 text-center bg-white rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-red-700">Account Deactivated</h1>
                    <p className="mt-2 text-gray-600">
                        Your account has been deactivated. Please contact support for assistance.
                    </p>
                </div>
            </div>
        )
    }

    let dashboardComponent;
    switch (user.role) {
      case Role.PATIENT:
        dashboardComponent = <PatientDashboard />;
        break;
      case Role.DIETICIAN:
        dashboardComponent = <DieticianDashboard />;
        break;
      case Role.ADMIN:
        dashboardComponent = <AdminDashboard />;
        break;
      default:
        dashboardComponent = <LoginPage />;
        break;
    }
    return <div className="p-4 sm:p-6 lg:p-8 animate-fade-in-up">{dashboardComponent}</div>
  };

  const showNavbar = !loading && user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {showNavbar && <Navbar />}
      <main>
        {renderDashboard()}
      </main>
    </div>
  );
};

export default App;
