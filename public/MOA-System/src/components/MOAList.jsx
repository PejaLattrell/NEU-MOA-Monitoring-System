import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, RotateCcw, Eye, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

const MOAList = ({ 
  showDeleted = false, 
  canEdit = false, 
  statusFilter = 'All', // 'All', 'APPROVED', etc.
  onEdit, 
  onViewAudit 
}) => {
  const { currentUser } = useAuth();
  const [moas, setMoas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  useEffect(() => {
    let q = query(collection(db, 'moas'), orderBy('effectiveDate', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const moaData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Apply initial filters based on props (Role restrictions)
        if (!showDeleted && data.isDeleted) return;
        if (statusFilter === 'APPROVED' && !data.status.startsWith('APPROVED')) return;

        moaData.push({ id: doc.id, ...data });
      });
      setMoas(moaData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showDeleted, statusFilter]);

  const handleDelete = async (moa) => {
    if (window.confirm(`Are you sure you want to delete ${moa.companyName}?`)) {
      try {
        await updateDoc(doc(db, 'moas', moa.id), { isDeleted: true });
        
        // Audit log
        await addDoc(collection(db, 'auditLogs'), {
          moaId: moa.id,
          actionName: 'delete',
          timestamp: new Date().toISOString(),
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email
        });
      } catch (error) {
        console.error("Error deleting MOA:", error);
      }
    }
  };

  const handleRecover = async (moa) => {
    if (window.confirm(`Are you sure you want to recover ${moa.companyName}?`)) {
      try {
        await updateDoc(doc(db, 'moas', moa.id), { isDeleted: false });
        
        // Audit log
        await addDoc(collection(db, 'auditLogs'), {
          moaId: moa.id,
          actionName: 'recover',
          timestamp: new Date().toISOString(),
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email
        });
      } catch (error) {
        console.error("Error recovering MOA:", error);
      }
    }
  };

  const filteredMoas = moas.filter(moa => {
    const searchString = `${moa.college || ''} ${moa.industryType || ''} ${moa.contactPerson || ''} ${moa.companyName || ''} ${moa.companyAddress || ''}`.toLowerCase();
    const matchSearch = searchString.includes(searchTerm.toLowerCase());
    const matchCollege = collegeFilter ? moa.endorsedByCollege === collegeFilter : true;
    const matchIndustry = industryFilter ? moa.industryType === industryFilter : true;

    return matchSearch && matchCollege && matchIndustry;
  });

  if (loading) return <div className="text-center py-10">Loading Data...</div>;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by company, contact, college, industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
          />
        </div>
        <div className="flex gap-2">
           <select 
             value={collegeFilter} 
             onChange={(e) => setCollegeFilter(e.target.value)}
             className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
           >
             <option value="">All Colleges</option>
             <option value="CCS">CCS</option>
             <option value="CBA">CBA</option>
             <option value="COE">COE</option>
             <option value="CAS">CAS</option>
             <option value="CON">CON</option>
           </select>
           <select 
             value={industryFilter} 
             onChange={(e) => setIndustryFilter(e.target.value)}
             className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
           >
             <option value="">All Industries</option>
             <option value="Technology">Technology</option>
             <option value="Finance">Finance</option>
             <option value="Healthcare">Healthcare</option>
             <option value="Education">Education</option>
             <option value="Food & Beverage">Food & Beverage</option>
             <option value="Telecom">Telecom</option>
           </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium text-sm">
                <th className="p-4">Company</th>
                {statusFilter !== 'APPROVED' && <th className="p-4">HTE ID</th>}
                <th className="p-4">Contact Person</th>
                <th className="p-4">Email</th>
                {statusFilter !== 'APPROVED' && (
                  <>
                    <th className="p-4">Status</th>
                    <th className="p-4">Effective Date</th>
                    <th className="p-4">College</th>
                  </>
                )}
                {canEdit && <th className="p-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMoas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">No MOAs found matching your criteria.</td>
                </tr>
              ) : (
                filteredMoas.map((moa) => (
                  <tr key={moa.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${moa.isDeleted ? 'bg-red-50/30 opacity-75' : ''}`}>
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-900">{moa.companyName} {moa.isDeleted && <span className="text-xs text-red-500 ml-2 font-normal">(Deleted)</span>}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{moa.companyAddress}</div>
                        {statusFilter !== 'APPROVED' && <div className="text-xs text-amber-600 font-medium mt-1">{moa.industryType}</div>}
                      </div>
                    </td>
                    {statusFilter !== 'APPROVED' && <td className="p-4 text-sm text-gray-600">{moa.hteId}</td>}
                    <td className="p-4 text-sm text-gray-800">{moa.contactPerson}</td>
                    <td className="p-4 text-sm text-gray-600">{moa.contactEmail}</td>
                    
                    {statusFilter !== 'APPROVED' && (
                      <>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                            ${moa.status?.startsWith('APPROVED') ? 'bg-green-100 text-green-800' : 
                              moa.status?.startsWith('PROCESSING') ? 'bg-amber-100 text-amber-800' :
                              moa.status?.startsWith('EXPIR') ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {moa.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                           {moa.effectiveDate ? format(new Date(moa.effectiveDate), 'MMM dd, yyyy') : 'N/A'}
                        </td>
                        <td className="p-4 text-sm text-gray-600 font-medium">{moa.endorsedByCollege}</td>
                      </>
                    )}

                    {canEdit && (
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                           {!moa.isDeleted ? (
                             <>
                              <button onClick={() => onEdit(moa)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(moa)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                             </>
                           ) : (
                              <button onClick={() => handleRecover(moa)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Recover">
                                <RotateCcw className="w-4 h-4" />
                              </button>
                           )}
                           {showDeleted && (
                              <button onClick={() => onViewAudit(moa)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Audit Trail">
                                <Eye className="w-4 h-4" />
                              </button>
                           )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MOAList;
