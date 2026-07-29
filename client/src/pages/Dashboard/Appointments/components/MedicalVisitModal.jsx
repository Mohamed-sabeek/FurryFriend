import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Stethoscope, Activity, FileText, Upload, Plus, Minus, Syringe, Pill, Save, CheckCircle
} from 'lucide-react';
import api from '../../../../utils/axios';
import toast from 'react-hot-toast';

const MedicalVisitModal = ({ isOpen, onClose, appointment, onSaveSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    medicalNotes: '',
    weight: '',
    height: '',
    newAllergies: '',
    newChronicDiseases: '',
    documents: []
  });

  const [medicines, setMedicines] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  
  // Fake upload state for Cloudinary simulation if real upload isn't connected
  const [uploading, setUploading] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', purpose: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const newMeds = [...medicines];
    newMeds[index][field] = value;
    setMedicines(newMeds);
  };

  const handleAddVaccine = () => {
    setVaccinations([...vaccinations, { name: '', date: new Date().toISOString().split('T')[0], nextDueDate: '' }]);
  };

  const handleRemoveVaccine = (index) => {
    setVaccinations(vaccinations.filter((_, i) => i !== index));
  };

  const handleVaccineChange = (index, field, value) => {
    const newVax = [...vaccinations];
    newVax[index][field] = value;
    setVaccinations(newVax);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      });
      const results = await Promise.all(uploadPromises);
      const urls = results.map(res => res.data.url);
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...urls] }));
      toast.success('Files uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload files. Please ensure the backend /upload route is configured.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorName || !formData.diagnosis) {
      toast.error('Doctor name and Diagnosis are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        symptoms: formData.symptoms, // It's a string, backend splits by comma
        newAllergies: formData.newAllergies ? formData.newAllergies.split(',').map(s=>s.trim()) : [],
        newChronicDiseases: formData.newChronicDiseases ? formData.newChronicDiseases.split(',').map(s=>s.trim()) : [],
        medicines: medicines.filter(m => m.name),
        vaccinations: vaccinations.filter(v => v.name)
      };

      const res = await api.post(`/vet/appointments/${appointment._id}/visit-details`, payload);
      
      if (res.data.success) {
        toast.success('Medical record saved successfully! AI Summary has been regenerated.');
        onSaveSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save visit details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary/5 px-6 py-4 flex items-center justify-between border-b border-primary/10">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Complete Medical Record</h2>
              <p className="text-xs text-gray-500 mt-1">Post-appointment findings for {appointment.pet?.petName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Form */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
            <form id="visitForm" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Doctor & Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Stethoscope size={16} className="text-primary"/> Diagnosis & Notes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Doctor Name *</label>
                    <input name="doctorName" value={formData.doctorName} onChange={handleChange} required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Dr. Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Diagnosis *</label>
                    <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g., Mild Ear Infection"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Symptoms Observed (comma separated)</label>
                    <input name="symptoms" value={formData.symptoms} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="e.g., Scratching ear, Redness"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Treatment Given</label>
                    <textarea name="treatment" value={formData.treatment} onChange={handleChange} rows="2"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      placeholder="Describe treatment performed in clinic..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Medical Notes (Doctor Remarks)</label>
                    <textarea name="medicalNotes" value={formData.medicalNotes} onChange={handleChange} rows="2"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      placeholder="Any additional notes for the pet owner..."
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Medicines */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Pill size={16} className="text-blue-500"/> Prescribed Medications</h3>
                  <button type="button" onClick={handleAddMedicine} className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    <Plus size={14} /> Add Medicine
                  </button>
                </div>
                
                {medicines.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No medications prescribed.</p>
                ) : (
                  <div className="space-y-3">
                    {medicines.map((med, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <input placeholder="Medicine Name" value={med.name} onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} className="text-sm border-b border-gray-200 py-1 outline-none focus:border-blue-500" />
                          <input placeholder="Dosage (e.g. 5ml)" value={med.dosage} onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)} className="text-sm border-b border-gray-200 py-1 outline-none focus:border-blue-500" />
                          <input placeholder="Frequency (e.g. Twice daily)" value={med.frequency} onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)} className="text-sm border-b border-gray-200 py-1 outline-none focus:border-blue-500" />
                          <input placeholder="Purpose" value={med.purpose} onChange={(e) => handleMedicineChange(index, 'purpose', e.target.value)} className="text-sm border-b border-gray-200 py-1 outline-none focus:border-blue-500" />
                        </div>
                        <button type="button" onClick={() => handleRemoveMedicine(index)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Minus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Vaccinations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Syringe size={16} className="text-green-500"/> Vaccinations Given</h3>
                  <button type="button" onClick={handleAddVaccine} className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
                    <Plus size={14} /> Add Vaccine
                  </button>
                </div>
                
                {vaccinations.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No vaccinations given.</p>
                ) : (
                  <div className="space-y-3">
                    {vaccinations.map((vax, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input placeholder="Vaccine Name" value={vax.name} onChange={(e) => handleVaccineChange(index, 'name', e.target.value)} className="text-sm border-b border-gray-200 py-1 outline-none focus:border-green-500" />
                          <div>
                            <label className="text-[10px] text-gray-400 block">Date Administered</label>
                            <input type="date" value={vax.date} onChange={(e) => handleVaccineChange(index, 'date', e.target.value)} className="w-full text-sm border-b border-gray-200 py-1 outline-none focus:border-green-500" />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 block">Next Due Date (Optional)</label>
                            <input type="date" value={vax.nextDueDate} onChange={(e) => handleVaccineChange(index, 'nextDueDate', e.target.value)} className="w-full text-sm border-b border-gray-200 py-1 outline-none focus:border-green-500" />
                          </div>
                        </div>
                        <button type="button" onClick={() => handleRemoveVaccine(index)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Minus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* Profile Updates */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Activity size={16} className="text-orange-500"/> Pet Profile Updates</h3>
                <p className="text-xs text-gray-500">Fill only if these changed during the visit. This will automatically update the pet's main profile.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Updated Weight (kg)</label>
                    <input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Updated Height (cm)</label>
                    <input name="height" type="number" step="0.1" value={formData.height} onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">New Allergies Discovered</label>
                    <input name="newAllergies" value={formData.newAllergies} onChange={handleChange} placeholder="e.g. Chicken, Dust (comma separated)"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">New Chronic Diseases / Conditions</label>
                    <input name="newChronicDiseases" value={formData.newChronicDiseases} onChange={handleChange} placeholder="e.g. Hip Dysplasia"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><FileText size={16} className="text-purple-500"/> Documents & Reports</h3>
                
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                  <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf" />
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-sm font-medium text-gray-600">Click or drag to upload Prescriptions / Lab Reports</p>
                  <p className="text-xs text-gray-400 mt-1">Supports PDF, JPG, PNG (Requires Cloudinary backend setup)</p>
                </div>
                
                {uploading && <p className="text-xs text-primary animate-pulse font-medium text-center">Uploading files...</p>}
                
                {formData.documents.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.documents.map((doc, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-xs font-medium border border-purple-100">
                        <CheckCircle size={12} /> Document {idx + 1}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button onClick={onClose} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button form="visitForm" type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50">
              {loading ? (
                <>Saving Record...</>
              ) : (
                <><Save size={16} /> Save Medical Record</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MedicalVisitModal;
