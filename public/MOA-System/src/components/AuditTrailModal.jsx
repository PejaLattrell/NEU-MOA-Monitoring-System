import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { X, Activity } from 'lucide-react';

const AuditTrailModal = ({ isOpen, onClose, moa }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !moa) return;

    const q = query(
      collection(db, 'auditLogs'),
      where('moaId', '==', moa.id),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logData = [];
      snapshot.forEach(doc => {
        logData.push({ id: doc.id, ...doc.data() });
      });
      setLogs(logData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, moa]);

  if (!isOpen) return null;

  const getActionColor = (action) => {
    switch (action) {
      case 'insert': return 'text-green-600 bg-green-50';
      case 'edit': return 'text-amber-600 bg-amber-50';
      case 'delete': return 'text-red-600 bg-red-50';
      case 'recover': return 'text-slate-600 bg-slate-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-bold text-gray-800">
              Audit Trail
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 border-b border-gray-100 bg-white">
            <p className="text-sm text-gray-500">History for MOA:</p>
            <p className="font-semibold text-gray-900">{moa.companyName}</p>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          {loading ? (
             <div className="text-center py-8 text-gray-500">Loading history...</div>
          ) : logs.length === 0 ? (
             <div className="text-center py-8 text-gray-500">No audit logs found for this entry.</div>
          ) : (
            <div className="space-y-6">
                {logs.map((log, index) => (
                    <div key={log.id} className="relative pl-6 border-l-2 border-gray-200 last:border-0 pb-6 last:pb-0">
                        <div className="absolute w-3 h-3 bg-white border-2 border-amber-500 rounded-full -left-[7px] top-1"></div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                           <div className="flex items-center justify-between mb-2">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${getActionColor(log.actionName)}`}>
                                 {log.actionName}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                 {format(new Date(log.timestamp), 'MMM dd, yyyy h:mm a')}
                              </span>
                           </div>
                           <p className="text-sm text-gray-700">
                              Action performed by: <span className="font-semibold text-gray-900">{log.userName}</span>
                           </p>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditTrailModal;
