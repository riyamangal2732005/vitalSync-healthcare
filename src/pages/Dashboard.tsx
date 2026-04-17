import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Spinner from './Spinner';

export default function Dashboard() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      await signOut(auth);
      navigate('/login'); 
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false);
    }
  };

  const { userData } = useAuth();
  if (!userData) return <p>Loading your profile...</p>;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-10">VitalSync</h2>
        <nav className="space-y-4">
          <p className="hover:text-blue-300 cursor-pointer">Dashboard</p>
          <p className="hover:text-blue-300 cursor-pointer">Appointments</p>
          <p className="hover:text-blue-300 cursor-pointer">Patients</p>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col border border-slate-20">
        {/* Top Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Overview</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
               Welcome, {userData?.firstName || "User"} ({userData?.role})
            </span>
            <button onClick={handleLogout} disabled={isLoggingOut} className={`px-4 py-2 rounded-lg transition ${
                isLoggingOut 
                ? 'bg-red-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white'}`}>

              {isLoggingOut ? <Spinner /> : 'Logout'}
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-2">General Health Awareness Camp</h3>
            <p className="text-gray-500">Scheduled for: April 19, 2026</p>
          </div>
        </main>
      </div>
    </div>
  );
}