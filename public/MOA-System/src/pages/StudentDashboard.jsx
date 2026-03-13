import React from 'react';
import MOAList from '../components/MOAList';

const StudentDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Approved MOAs</h1>
      </div>
      
      <div className="pt-2">
         <MOAList 
            showDeleted={false} 
            canEdit={false} 
            statusFilter="APPROVED" 
         />
      </div>
    </div>
  );
};

export default StudentDashboard;
