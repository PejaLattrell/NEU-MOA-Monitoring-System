import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import MOAList from '../components/MOAList';
import MOAFormModal from '../components/MOAFormModal';
import AuditTrailModal from '../components/AuditTrailModal';
import { Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ active: 0, processing: 0, expired: 0 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMoa, setSelectedMoa] = useState(null);
  
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditMoa, setAuditMoa] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'moas'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let active = 0, processing = 0, expired = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.isDeleted) return;
        
        if (data.status?.startsWith('APPROVED')) active++;
        else if (data.status?.startsWith('PROCESSING')) processing++;
        else if (data.status?.startsWith('EXPIR')) expired++;
      });
      setStats({ active, processing, expired });
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (moa) => {
    setSelectedMoa(moa);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedMoa(null);
    setIsFormOpen(true);
  };

  const handleViewAudit = (moa) => {
    setAuditMoa(moa);
    setIsAuditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Administrator Overview</h1>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm font-medium border border-slate-700"
        >
          <Plus className="w-5 h-5 text-amber-400" />
          Create New MOA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
            <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active MOAs</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.active}</p>
            </div>
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7" />
            </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
            <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Processing</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.processing}</p>
            </div>
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                 <Clock className="w-7 h-7" />
            </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
            <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Expired/Expiring</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.expired}</p>
            </div>
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
            </div>
        </div>
      </div>

      <div className="pt-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Masterlist Directory</h2>
          <MOAList 
            showDeleted={true} 
            canEdit={true} 
            statusFilter="All" 
            onEdit={handleEdit} 
            onViewAudit={handleViewAudit} 
          />
      </div>

      <MOAFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        existingMoa={selectedMoa} 
      />

      <AuditTrailModal 
        isOpen={isAuditOpen} 
        onClose={() => setIsAuditOpen(false)} 
        moa={auditMoa} 
      />
    </div>
  );
};

export default AdminDashboard;
