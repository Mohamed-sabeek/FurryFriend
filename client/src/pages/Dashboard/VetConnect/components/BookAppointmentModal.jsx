import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, MapPin, Video, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

const BookAppointmentModal = ({ isOpen, onClose }) => {
  const { pets } = useSelector((state) => state.pets);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    petId: null,
    type: 'General Checkup',
    reason: '',
    symptoms: [],
    date: '',
    time: '',
    isEmergency: false,
    clinicId: null,
    vetId: null,
    videoConsultation: false,
    homeVisit: false
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-poppins font-bold text-gray-800">Book Appointment</h2>
            <p className="text-sm text-gray-500 font-medium">Step {step} of 4: {['Select Pet', 'Details', 'Preferences', 'Confirmation'][step - 1]}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors border border-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100 w-full shrink-0">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
          ></motion.div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Who is the appointment for?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pets && pets.length > 0 ? (
                    pets.map(pet => (
                      <div 
                        key={pet._id} 
                        onClick={() => setFormData({ ...formData, petId: pet._id })}
                        className={`border-2 rounded-2xl p-4 cursor-pointer transition-all text-center ${formData.petId === pet._id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50'}`}
                      >
                        {pet.profileImage ? (
                          <img src={pet.profileImage} alt={pet.name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center text-gray-400 font-bold text-xl">
                            {pet.name.charAt(0)}
                          </div>
                        )}
                        <p className="font-bold text-gray-800">{pet.name}</p>
                        <p className="text-xs text-gray-500">{pet.species} {pet.breed ? `- ${pet.breed}` : ''}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-gray-500">
                      You haven't added any pets yet. Please add a pet in the "My Pets" tab first.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Type</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    {['General Checkup', 'Vaccination', 'Emergency', 'Dental', 'Surgery', 'Skin', 'Nutrition', 'Behavior', 'Follow Up'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Visit</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none resize-none"
                    placeholder="Briefly describe the issue..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
                    <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Time</label>
                    <input type="time" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setFormData({ ...formData, videoConsultation: !formData.videoConsultation, homeVisit: false })}
                    className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-3 ${formData.videoConsultation ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}
                  >
                    <Video size={32} />
                    <span className="font-bold">Video Consultation</span>
                  </div>
                  <div 
                    onClick={() => setFormData({ ...formData, homeVisit: !formData.homeVisit, videoConsultation: false })}
                    className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-3 ${formData.homeVisit ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}
                  >
                    <Home size={32} />
                    <span className="font-bold">Home Visit</span>
                  </div>
                </div>

                {!formData.videoConsultation && !formData.homeVisit && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select Clinic (Optional)</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                        <option>Any Available Clinic</option>
                        <option>City Vet Clinic</option>
                        <option>Downtown Animal Hospital</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Select Vet (Optional)</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                        <option>Any Available Vet</option>
                        <option>Dr. Sarah Johnson</option>
                        <option>Dr. Michael Chen</option>
                      </select>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Appointment Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500 font-medium">Pet</span>
                      <span className="font-bold text-gray-800">
                        {pets?.find(p => p._id === formData.petId)?.name || 'Select a pet'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500 font-medium">Type</span>
                      <span className="font-bold text-gray-800">{formData.type}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500 font-medium">Mode</span>
                      <span className="font-bold text-gray-800">
                        {formData.videoConsultation ? 'Video Call' : formData.homeVisit ? 'Home Visit' : 'In-Clinic'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-gray-500 text-sm">By confirming, you agree to our cancellation policy.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-between shrink-0">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 bg-gray-100'}`}
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          {step < 4 ? (
            <button 
              onClick={nextStep}
              className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary-hover transition-colors shadow-glow flex items-center gap-2"
            >
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={() => {
                // Submit logic here
                onClose();
              }}
              className="bg-green-500 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-green-600 transition-colors shadow-glow-green"
            >
              Confirm Booking
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BookAppointmentModal;
