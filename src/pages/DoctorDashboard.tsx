import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, onSnapshot, query, orderBy, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const DoctorDashboard = () => {
    const { user } = useAuth();
  // 1. Digital Memory for our inputs and our list
    const [allPatients, setAllPatients] = useState<any[]>([]);
    const [patientName, setPatientName] = useState('');
    const [patientUid, setPatientUid] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDiagnosis, setEditDiagnosis] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
  // This looks at the 'users' folder specifically for Patients
        const q = query(collection(db, "users"), where("role", "==", "patient"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllPatients(list);
        });
        return () => unsubscribe();
        }, []);
    // 2. READ: The "Telescope" (Watching the database)
    useEffect(() => {
        // Tell the computer to look at the 'patients' folder
        const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
        
        // Every time a new patient is added, this code runs automatically
        const unsubscribe = onSnapshot(q, (snapshot) => {
        const patientList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setPatients(patientList);
        });

        return () => unsubscribe();
    }, []);
    // 3. CREATE: The "Note Taker" (Saving to the cloud)
    const handleAddPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientName || !diagnosis || !patientUid || !user) 
        {
            alert("Please fill all boxes!");
            return;
        }

        try {
        // Send the info to the 'patients' folder in Firebase
        await addDoc(collection(db, "patients"), {
            name: patientName,
            diagnosis: diagnosis,
            patientUid: patientUid,
            createdAt: new Date(),
            doctorId: user?.uid || "Unknown"
        });
        setPatientName('');
        setDiagnosis('');
        setPatientUid('');
        } catch (error) {
        console.error("Error adding patient: ", error);
            }
        };
    
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            const recordRef = doc(db, "patients", editingId);
            await updateDoc(recordRef, {
            diagnosis: editDiagnosis,
            lastUpdated: new Date()
            });
            setIsEditModalOpen(false);
            setEditingId(null);
        } catch (error) {
            console.error("Error updating record:", error);
        }
    };
    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this patient record?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, "patients", id));
            } catch (error) {
            console.error("Error deleting record:", error);
            }
        }
    }
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    const chartData = patients.reduce((acc: { name: string; value: number }[], current: any) => {
    const existing = acc.find(item => item.name === current.diagnosis);
    if (existing) {
        existing.value += 1;
    } else {
        acc.push({ name: current.diagnosis || "Unknown", value: 1 });
    }
    return acc;
    }, []);

    return (
        <div className="bg-white p-8 px-12 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10 border border-gray-50">
            <h1 className="text-2xl font-bold mb-6 text-blue-700">Doctor's Control Center 🩺</h1>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight">Diagnosis Overview 📊</h3>
                    <p className="text-sm text-gray-400 mt-1">Real-time patient statistics</p>
                </div>
                {patients.length > 0 && (
                    <span className="text-sm font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    Total Cases: {patients.length}
                    </span>
                )}
            </div>
            
            {/* logic to handle empty patient details */}
            {patients.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-gray-50 p-6 rounded-full">
                        <span className="text-4xl">📈</span>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700">No Patient Data Yet</h4>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">
                        Add your first patient below to see the diagnosis analytics appear here.
                        </p>
                    </div>
                </div>
            ) : (
            <div style={{ width: '100%', height: '300px' }}>
                {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 500, fill: '#94a3b8' }}
                            dy={10} 
                            />
                            <YAxis hide domain={[0, 'dataMax + 1']} /> 
                            <Tooltip 
                            cursor={{ fill: '#f8fafc', radius: 10 }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar 
                            dataKey="value" 
                            barSize={45} // thin bars in order to avoid crowding
                            radius={[10, 10, 10, 10]} // Rounded tops for a professional look
                            >
                            {chartData.map((_entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} 
                                style={{ filter: `drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15))`}}/>
                            ))} 
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                
                )}
                
            </div>
            )}

            {/* The form for adding new patients */}
            <form onSubmit={handleAddPatient} className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-lg font-semibold mb-4">Add New Patient</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                        type="text" 
                        placeholder="Patient Name" 
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <select 
                        className="border p-2 rounded w-full bg-white"
                        value={patientUid}
                        onChange={(e) => {
                            const selectedUid = e.target.value;
                            setPatientUid(selectedUid);
                            
                            // This part automatically finds the name so you don't have to type it
                            const selectedPatient = allPatients.find(p => p.uid === selectedUid);
                            setPatientName(selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : '');
                        }}
                        >
                            <option value="">-- Select Registered Patient --</option>
                            {allPatients.map((p) => (
                                <option key={p.uid} value={p.uid}>
                                {p.firstName} {p.lastName}
                                </option>
                            ))}
                        </select>
                    <input 
                        type="text" 
                        placeholder="Diagnosis" 
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                </div>
                <button type="submit" className="mt-6 bg-blue-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                    Save
                </button>
            </form>

            {/* The table for viewing the data*/}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Diagnosis</th>
                            <th className="p-4">Patient UID</th>
                            <th className="p-4">Date Added</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((p) => (
                        <tr key={p.id} className="border-t">
                            <td className="p-4 font-medium">{p.name}</td>
                            
                            <td className="p-4 text-xs font-mono text-gray-500">
                            {p.patientUid || "No UID"} 
                            </td>

                            <td className="p-4">{p.diagnosis}</td>
                            <td className="p-4 text-gray-500 text-sm">
                            {p.createdAt?.toDate().toLocaleDateString()}
                            </td>

                            <td className="p-4 flex gap-2">
                                <button 
                                    onClick={() => {
                                    setEditingId(p.id);
                                    setEditDiagnosis(p.diagnosis); // Pre-fill the data
                                    setIsEditModalOpen(true);
                                    }}
                                    className="text-blue-600 hover:underline text-sm font-medium">
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(p.id)}
                                    className="text-red-600 hover:underline text-sm font-medium">
                                    Delete
                                </button>
                                </td> 
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* handling empty state for table */}
            {patients.length === 0 && (
                <div className="p-20 text-center">
                    <p className="text-gray-400 font-medium">No patient records found.</p>
                </div>
            )}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Diagnosis</h2>
                        <form onSubmit={handleUpdate}>
                            <textarea
                            className="w-full border p-3 rounded-lg mb-4"
                            value={editDiagnosis}
                            onChange={(e) => setEditDiagnosis(e.target.value)}
                            rows={4}/>
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                     </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;