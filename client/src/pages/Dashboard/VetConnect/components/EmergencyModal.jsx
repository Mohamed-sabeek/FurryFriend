import React, { useState } from 'react';
import { X, AlertTriangle, Phone, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

const EmergencyModal = ({ isOpen, onClose }) => {
  const { pets } = useSelector((state) => state.pets);
  const [formData, setFormData] = useState({
    petId: null,
    symptoms: '',
    severity: 'High',
    breathing: false,
    bleeding: false,
    vomiting: false,
    conscious: true,
    temperature: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-red-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border-2 border-red-500"
      >
        {/* Header */}
        <div className="bg-red-500 text-white px-8 py-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-poppins font-bold">Emergency Consultation</h2>
              <p className="text-red-100 text-sm font-medium">Please provide details immediately.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          <div className="bg-red-50 rounded-2xl p-4 flex gap-4 items-start border border-red-100">
            <Phone className="text-red-500 shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-800 font-semibold">
              If this is a life-threatening emergency, please do not wait for the AI analysis. Go to the nearest 24/7 veterinary clinic immediately.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Which Pet?</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {pets && pets.length > 0 ? (
                pets.map(pet => (
                  <div 
                    key={pet._id} 
                    onClick={() => setFormData({ ...formData, petId: pet._id })}
                    className={`border-2 rounded-2xl p-3 cursor-pointer transition-all text-center ${formData.petId === pet._id ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}
                  >
                    <p className="font-bold text-gray-800">{pet.name}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-2 text-red-500 font-medium text-sm">
                  No pets found. Please go directly to a clinic.
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Describe the Symptoms</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none resize-none"
              placeholder="What happened? When did it start?"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Critical Conditions Check</label>
            <div className="grid grid-cols-2 gap-3">
              {['breathing', 'bleeding', 'vomiting', 'conscious'].map(condition => (
                <label key={condition} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-red-500 rounded border-gray-300 focus:ring-red-500"
                    checked={formData[condition]}
                    onChange={(e) => setFormData({ ...formData, [condition]: e.target.checked })}
                  />
                  <span className="font-semibold text-gray-700 capitalize">
                    {condition === 'breathing' ? 'Difficulty Breathing' : condition === 'conscious' ? 'Is Conscious' : `Severe ${condition}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end shrink-0">
          <button 
            onClick={() => {
              // Submit emergency request
              onClose();
            }}
            className="bg-red-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-glow-red flex items-center gap-2"
          >
            <Activity size={20} />
            Submit Emergency Request
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmergencyModal;
