import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle2, Activity, Coffee, Moon, HandHeart } from 'lucide-react';
import api from '../../../utils/axios';
import toast from 'react-hot-toast';

const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 bg-primary/10 rounded-xl text-primary">
        <Icon size={18} />
      </div>
      <h3 className="font-bold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const BoardingReportForm = ({ isOpen, appointment, onClose, onSaveSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    generalHealth: 'Excellent',
    eatingBehaviour: 'Normal',
    sleepingPattern: 'Normal',
    playActivity: 'Active',
    socialBehaviour: 'Friendly',
    medicationGiven: '',
    productsUsed: '',
    healthObservations: '',
    weightChange: 'None',
    specialIncidents: '',
    dailyNotes: '',
    overallStaySummary: '',
    homeCareAdvice: '',
    recommendedNextBoarding: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/boarding/center/appointments/${appointment._id}/complete`, formData);
      if (res.data.success) {
        toast.success('Boarding stay completed successfully!');
        onSaveSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete stay');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Complete Boarding Stay</h2>
                <p className="text-sm text-gray-500">Record summary for {appointment?.pet?.petName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-8">
            <form id="boarding-report-form" onSubmit={handleSubmit} className="space-y-6">
              
              <FormSection title="Behaviour & Activity" icon={Activity}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Eating Behaviour</label>
                    <select name="eatingBehaviour" value={formData.eatingBehaviour} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary">
                      <option>Normal</option>
                      <option>Ate less than usual</option>
                      <option>Ate more than usual</option>
                      <option>Picky eater</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sleeping Pattern</label>
                    <select name="sleepingPattern" value={formData.sleepingPattern} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary">
                      <option>Normal</option>
                      <option>Restless</option>
                      <option>Slept a lot</option>
                      <option>Trouble sleeping initially</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Play Activity</label>
                    <select name="playActivity" value={formData.playActivity} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary">
                      <option>Active</option>
                      <option>Very Active</option>
                      <option>Calm / Relaxed</option>
                      <option>Shy / Timid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Social Behaviour</label>
                    <select name="socialBehaviour" value={formData.socialBehaviour} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary">
                      <option>Friendly</option>
                      <option>Playful with others</option>
                      <option>Prefers humans</option>
                      <option>Reserved</option>
                    </select>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Health & Care" icon={HandHeart}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">General Health</label>
                    <select name="generalHealth" value={formData.generalHealth} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary">
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Fair</option>
                      <option>Needs Attention</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Weight Change</label>
                    <select name="weightChange" value={formData.weightChange} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary">
                      <option>None</option>
                      <option>Lost weight</option>
                      <option>Gained weight</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Health Observations / Special Incidents</label>
                    <textarea name="healthObservations" value={formData.healthObservations} onChange={handleChange} rows="2" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary resize-none" placeholder="Any minor issues, vomitting, scratching, etc."></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Medication Given (if any)</label>
                    <input type="text" name="medicationGiven" value={formData.medicationGiven} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary" placeholder="E.g., Heartgard as per instructions" />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Summary & Advice" icon={FileText}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Overall Stay Summary</label>
                    <textarea name="overallStaySummary" value={formData.overallStaySummary} onChange={handleChange} rows="3" required className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary resize-none" placeholder="Provide a summary of the pet's stay for the owner..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Home Care Advice</label>
                    <textarea name="homeCareAdvice" value={formData.homeCareAdvice} onChange={handleChange} rows="2" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary resize-none" placeholder="E.g., Pet might be extra tired for a day, stick to regular diet..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Recommended Next Boarding / Trial Date (Optional)</label>
                    <input type="date" name="recommendedNextBoarding" value={formData.recommendedNextBoarding} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary" />
                  </div>
                </div>
              </FormSection>

            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="boarding-report-form"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {loading ? 'Saving...' : 'Complete & Save'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BoardingReportForm;
