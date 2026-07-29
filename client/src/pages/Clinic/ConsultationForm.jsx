import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Pill, Syringe, FileText, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/axios';

const ConsultationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diagnosis');

  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
    weight: '',
    temperature: '',
    heartRate: '',
    allergies: '',
    dietAdvice: '',
    exerciseAdvice: '',
    followUpDate: '',
    medicines: [],
    vaccinations: []
  });

  const [medInput, setMedInput] = useState({ name: '', dosage: '', frequency: '', purpose: '' });
  const [vaccInput, setVaccInput] = useState({ name: '', dose: '', nextDueDate: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addMedicine = () => {
    if (!medInput.name || !medInput.dosage) return toast.error('Name and dosage required');
    setFormData(prev => ({ ...prev, medicines: [...prev.medicines, medInput] }));
    setMedInput({ name: '', dosage: '', frequency: '', purpose: '' });
  };

  const addVaccination = () => {
    if (!vaccInput.name) return toast.error('Vaccine name required');
    setFormData(prev => ({ ...prev, vaccinations: [...prev.vaccinations, vaccInput] }));
    setVaccInput({ name: '', dose: '', nextDueDate: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Quick validation
    if (!formData.diagnosis) return toast.error('Diagnosis is required');

    setLoading(true);
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
        weight: Number(formData.weight) || undefined,
        temperature: Number(formData.temperature) || undefined,
        heartRate: Number(formData.heartRate) || undefined,
      };

      await api.post(`/clinic/appointments/${id}/consultation`, payload);
      toast.success('Consultation saved! AI Orchestrator triggered.');
      navigate('/clinic/appointments');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save consultation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-xl transition-colors text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Start Consultation</h1>
          <p className="text-sm text-gray-500">Fill in the medical details. This will become the Single Source of Truth for the AI agents.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {[
            { id: 'diagnosis', label: 'Diagnosis & Vitals', icon: Activity },
            { id: 'medicines', label: 'Medicines', icon: Pill },
            { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
            { id: 'notes', label: 'Advice & Notes', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">
          {activeTab === 'diagnosis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Temp (°C/°F)</label>
                  <input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Heart Rate (bpm)</label>
                  <input type="number" name="heartRate" value={formData.heartRate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Diagnosis *</label>
                <textarea name="diagnosis" value={formData.diagnosis} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="Enter primary diagnosis..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Treatment Provided</label>
                <textarea name="treatment" value={formData.treatment} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"></textarea>
              </div>
            </div>
          )}

          {activeTab === 'medicines' && (
            <div className="space-y-6">
              <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-4">
                <h4 className="font-bold text-blue-900">Prescribe Medicine</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Medicine Name" value={medInput.name} onChange={e => setMedInput({...medInput, name: e.target.value})} className="px-4 py-2 border border-blue-200 rounded-lg" />
                  <input type="text" placeholder="Dosage (e.g. 50mg)" value={medInput.dosage} onChange={e => setMedInput({...medInput, dosage: e.target.value})} className="px-4 py-2 border border-blue-200 rounded-lg" />
                  <input type="text" placeholder="Frequency (e.g. Twice a day)" value={medInput.frequency} onChange={e => setMedInput({...medInput, frequency: e.target.value})} className="px-4 py-2 border border-blue-200 rounded-lg" />
                  <input type="text" placeholder="Purpose" value={medInput.purpose} onChange={e => setMedInput({...medInput, purpose: e.target.value})} className="px-4 py-2 border border-blue-200 rounded-lg" />
                </div>
                <button type="button" onClick={addMedicine} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">Add Medicine</button>
              </div>

              {formData.medicines.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900">Added Medicines</h4>
                  {formData.medicines.map((m, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <span className="font-bold text-primary">{m.name}</span> • <span className="text-gray-600 text-sm">{m.dosage} ({m.frequency})</span>
                      </div>
                      <button onClick={() => setFormData(prev => ({...prev, medicines: prev.medicines.filter((_, idx) => idx !== i)}))} className="text-red-500 text-sm font-bold">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vaccinations' && (
            <div className="space-y-6">
              <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 space-y-4">
                <h4 className="font-bold text-emerald-900">Administer Vaccine</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Vaccine Name" value={vaccInput.name} onChange={e => setVaccInput({...vaccInput, name: e.target.value})} className="px-4 py-2 border border-emerald-200 rounded-lg" />
                  <input type="text" placeholder="Dose (Optional)" value={vaccInput.dose} onChange={e => setVaccInput({...vaccInput, dose: e.target.value})} className="px-4 py-2 border border-emerald-200 rounded-lg" />
                  <input type="date" placeholder="Next Due Date" value={vaccInput.nextDueDate} onChange={e => setVaccInput({...vaccInput, nextDueDate: e.target.value})} className="px-4 py-2 border border-emerald-200 rounded-lg" />
                </div>
                <button type="button" onClick={addVaccination} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700">Add Vaccine</button>
              </div>

              {formData.vaccinations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900">Added Vaccines</h4>
                  {formData.vaccinations.map((v, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <span className="font-bold text-primary">{v.name}</span> {v.nextDueDate && <span className="text-gray-600 text-sm"> • Due next: {new Date(v.nextDueDate).toLocaleDateString()}</span>}
                      </div>
                      <button onClick={() => setFormData(prev => ({...prev, vaccinations: prev.vaccinations.filter((_, idx) => idx !== i)}))} className="text-red-500 text-sm font-bold">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Dietary Advice</label>
                <textarea name="dietAdvice" value={formData.dietAdvice} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="Special diet rules..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Exercise Advice</label>
                <textarea name="exerciseAdvice" value={formData.exerciseAdvice} onChange={handleInputChange} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Allergies (comma separated)</label>
                <input type="text" name="allergies" value={formData.allergies} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="e.g. Chicken, Dust" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Follow-up Date</label>
                  <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
          <button onClick={() => navigate(-1)} className="px-6 py-3 font-bold text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm shadow-primary/30">
            {loading ? 'Saving...' : (
              <>
                <CheckCircle2 size={20} />
                Save & Complete Consultation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationForm;
