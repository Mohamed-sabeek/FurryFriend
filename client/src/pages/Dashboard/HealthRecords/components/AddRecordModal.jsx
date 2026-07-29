import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Syringe, Pill, FileUp } from 'lucide-react';
import api from '../../../../utils/axios';
import toast from 'react-hot-toast';

const AddRecordModal = ({ isOpen, onClose, petId, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('record');
  const [loading, setLoading] = useState(false);
  
  // Basic form state
  const [formData, setFormData] = useState({
    // Record
    visitType: '', hospital: '', doctor: '', visitDate: '', diagnosis: '', treatment: '',
    // Vaccine
    vaccineName: '', vaccinatedDate: '', nextDueDate: '', status: 'Completed',
    // Medication
    medicineName: '', dosage: '', frequency: '', startDate: '',
    // Document
    title: '', type: 'Lab Report'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'record') {
        await api.post(`/health-records/${petId}`, formData);
      } else if (activeTab === 'vaccination') {
        await api.post(`/health-records/vaccinations/${petId}`, formData);
      } else if (activeTab === 'medication') {
        await api.post(`/health-records/medications/${petId}`, formData);
      } else if (activeTab === 'document') {
        // Mock document upload URL for now since real Cloudinary integration takes extra fields
        const docData = { ...formData, fileUrl: 'https://example.com/mock-report.pdf' };
        await api.post(`/health-records/documents/${petId}`, docData);
      }
      
      toast.success('Record added successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-poppins font-bold text-text-heading">Add Health Record</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex border-b border-gray-100">
            <button 
              onClick={() => setActiveTab('record')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'record' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FileText size={16} /> Vet Visit
            </button>
            <button 
              onClick={() => setActiveTab('vaccination')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'vaccination' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Syringe size={16} /> Vaccination
            </button>
            <button 
              onClick={() => setActiveTab('medication')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'medication' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Pill size={16} /> Medication
            </button>
            <button 
              onClick={() => setActiveTab('document')}
              className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'document' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FileUp size={16} /> Document
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
              
              {/* Record Tab */}
              {activeTab === 'record' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Visit Type</label>
                      <input required name="visitType" value={formData.visitType} onChange={handleChange} placeholder="e.g. General Checkup" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Visit Date</label>
                      <input required type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Hospital</label>
                      <input required name="hospital" value={formData.hospital} onChange={handleChange} placeholder="Hospital Name" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Doctor</label>
                      <input name="doctor" value={formData.doctor} onChange={handleChange} placeholder="Dr. Name" className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Diagnosis</label>
                    <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="What was the diagnosis?" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Treatment</label>
                    <textarea name="treatment" value={formData.treatment} onChange={handleChange} rows="2" placeholder="Treatment details..." className="input-field"></textarea>
                  </div>
                </>
              )}

              {/* Vaccination Tab */}
              {activeTab === 'vaccination' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Vaccine Name</label>
                    <input required name="vaccineName" value={formData.vaccineName} onChange={handleChange} placeholder="e.g. Rabies" className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Date Administered</label>
                      <input required type="date" name="vaccinatedDate" value={formData.vaccinatedDate} onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Next Due Date</label>
                      <input type="date" name="nextDueDate" value={formData.nextDueDate} onChange={handleChange} className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                      <option value="Completed">Completed</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </>
              )}

              {/* Medication Tab */}
              {activeTab === 'medication' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Medicine Name</label>
                    <input required name="medicineName" value={formData.medicineName} onChange={handleChange} placeholder="e.g. Amoxicillin" className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Dosage</label>
                      <input required name="dosage" value={formData.dosage} onChange={handleChange} placeholder="e.g. 50mg" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Frequency</label>
                      <input required name="frequency" value={formData.frequency} onChange={handleChange} placeholder="e.g. Twice a day" className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Start Date</label>
                    <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="input-field" />
                  </div>
                </>
              )}

              {/* Document Tab */}
              {activeTab === 'document' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Document Title</label>
                    <input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Annual Blood Test" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                      <option value="Lab Report">Lab Report</option>
                      <option value="Prescription">Prescription</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50">
                    <FileUp className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm font-bold text-gray-600">Click to upload file</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                  </div>
                </>
              )}

            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button disabled={loading} type="submit" className="btn-primary w-32 flex justify-center">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Record'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddRecordModal;
