import React, { useState } from 'react';
import MOAList from '../components/MOAList';
import MOAFormModal from '../components/MOAFormModal';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';

const FacultyDashboard = () => {
  const { userData } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMoa, setSelectedMoa] = useState(null);

  // Check if faculty has permissions
  const canManageMOA = userData?.canManageMOA === true;

  const handleEdit = (moa) => {
    setSelectedMoa(moa);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedMoa(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Faculty Masterlist</h1>
        {canManageMOA && (
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm font-medium border border-slate-700"
          >
            <Plus className="w-5 h-5 text-amber-400" />
            Create New MOA
          </button>
        )}
      </div>
      
      <div className="pt-2">
         <MOAList 
            showDeleted={false} 
            canEdit={canManageMOA} 
            statusFilter="All" 
            onEdit={handleEdit} 
         />
      </div>

      <MOAFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        existingMoa={selectedMoa} 
      />
    </div>
  );
};

export default FacultyDashboard;
