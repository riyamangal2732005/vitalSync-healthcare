import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [myRecords, setMyRecords] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // THE MAGIC: Filter so it only pulls records matching the logged-in user's UID
    const q = query(
      collection(db, "patients"), 
      where("patientUid", "==", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyRecords(docs);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-700">My Health Reports 📋</h1>
      
      {myRecords.length === 0 ? (
        <div className="p-10 text-center bg-gray-100 rounded-xl border-2 border-dashed">
          <p className="text-gray-500">No medical records found yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myRecords.map((record) => (
            <div key={record.id} className="bg-white p-6 rounded-xl shadow-md border-l-8 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Diagnosis</p>
                  <h3 className="text-xl font-semibold text-gray-800">{record.diagnosis}</h3>
                </div>
                <span className="text-sm text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {record.createdAt?.toDate() ? record.createdAt.toDate().toLocaleDateString() : 'Pending...'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;