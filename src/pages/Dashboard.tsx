import { useAuth } from '../context/AuthContext';
import DoctorDashboard from "./DoctorDashboard"; 
import PatientDashboard from './PatientDashboard';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Spinner from './Spinner';

export default function Dashboard() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { userData, loading } = useAuth(); // We get the ID card (userData) here

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      navigate('/login'); 
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false);
    }
  };

  // 1. If the computer is still checking the ID card, show a loading screen
  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - This stays the same for everyone */}
      <div className="w-64 bg-slate-900 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-10">VitalSync</h2>
        <nav className="space-y-4">
          <p className="hover:text-blue-300 cursor-pointer font-bold text-blue-400">Dashboard</p>
          {/* <p className="hover:text-blue-300 cursor-pointer">Appointments</p>
          {userData?.role === "doctor" && (
            <p className="hover:text-blue-300 cursor-pointer flex items-center gap-2">
              Patients List
            </p>
          )} */}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Overview</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
               Welcome, {userData?.firstName || "User"} ({userData?.role})
            </span>
            <button onClick={handleLogout} disabled={isLoggingOut} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </header>

        {/* --- THE MAGIC PART (Dynamic Content) --- */}
        <main className="p-8 flex-1 overflow-y-auto">
          {/* If role is doctor, show the Doctor's Desk (Form + Table) */}
          {userData?.role === "doctor" ? (
            <DoctorDashboard />
          ) : userData?.role === "patient" ? (
            /* REPLACE THE OLD DIV WITH THE ACTUAL COMPONENT */
            <PatientDashboard /> 
          ) : (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-600">
              Error: No role assigned to this account.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}