import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

const STATUS_OPTIONS = [
  "APPROVED: Signed by President",
  "APPROVED: On-going notarization",
  "APPROVED: No notarization needed",
  "PROCESSING: Awaiting signature of the MOA draft by HTE partner",
  "PROCESSING: MOA draft sent to Legal Office for Review",
  "PROCESSING: MOA draft and opinion of legal office sent to VPAA/OP for approval",
  "EXPIRED: No renewal done",
  "EXPIRING: Two months before expiration of date"
];

const MOAFormModal = ({ isOpen, onClose, existingMoa = null }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hteId: '',
    companyName: '',
    companyAddress: '',
    contactPerson: '',
    contactEmail: '',
    industryType: 'Technology',
    endorsedByCollege: 'CCS',
    effectiveDate: '',
    expirationDate: '',
    status: STATUS_OPTIONS[0]
  });

  useEffect(() => {
    if (existingMoa) {
      setFormData({
        hteId: existingMoa.hteId || '',
        companyName: existingMoa.companyName || '',
        companyAddress: existingMoa.companyAddress || '',
        contactPerson: existingMoa.contactPerson || '',
        contactEmail: existingMoa.contactEmail || '',
        industryType: existingMoa.industryType || 'Technology',
        endorsedByCollege: existingMoa.endorsedByCollege || 'CCS',
        effectiveDate: existingMoa.effectiveDate || '',
        expirationDate: existingMoa.expirationDate || '',
        status: existingMoa.status || STATUS_OPTIONS[0]
      });
    } else {
      setFormData({
        hteId: '',
        companyName: '',
        companyAddress: '',
        contactPerson: '',
        contactEmail: '',
        industryType: 'Technology',
        endorsedByCollege: 'CCS',
        effectiveDate: '',
        expirationDate: '',
        status: STATUS_OPTIONS[0]
      });
    }
  }, [existingMoa, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (existingMoa) {
        // Edit existing
        await updateDoc(doc(db, 'moas', existingMoa.id), {
          ...formData
        });
        
        // Log edit
        await addDoc(collection(db, 'auditLogs'), {
          moaId: existingMoa.id,
          actionName: 'edit',
          timestamp: new Date().toISOString(),
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email
        });
      } else {
        // Insert new
        const docRef = await addDoc(collection(db, 'moas'), {
          ...formData,
          isDeleted: false
        });

        // Log insert
        await addDoc(collection(db, 'auditLogs'), {
          moaId: docRef.id,
          actionName: 'insert',
          timestamp: new Date().toISOString(),
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving MOA:", error);
      alert("Failed to save MOA. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            {existingMoa ? 'Edit MOA Entry' : 'Create New MOA'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HTE ID *</label>
              <input required type="text" name="hteId" value={formData.hteId} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Address *</label>
            <input required type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input required type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
              <input required type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry Type</label>
              <select name="industryType" value={formData.industryType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition bg-white">
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Telecom">Telecom</option>
                <option value="Services">Services</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endorsed By College</label>
              <select name="endorsedByCollege" value={formData.endorsedByCollege} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition bg-white">
                <option value="CCS">CCS</option>
                <option value="CBA">CBA</option>
                <option value="COE">COE</option>
                <option value="CAS">CAS</option>
                <option value="CON">CON</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
              <input type="date" name="effectiveDate" value={formData.effectiveDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition" />
            </div>
          </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MOA Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition bg-white">
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
          <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 text-slate-900 font-bold bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
            {loading ? 'Saving...' : 'Save MOA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MOAFormModal;
