import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Scissors, Syringe, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const SERVICES_LIST = [
  'Bath & Blow Dry', 'Haircut / Styling', 'Nail Trimming', 'Ear Cleaning',
  'Teeth Brushing', 'De-Shedding Treatment', 'Flea & Tick Treatment',
  'Anal Gland Expression', 'Paw Pad Trimming', 'Sanitary Trim'
];

const PRODUCTS_LIST = [
  'Oatmeal Shampoo', 'Hypoallergenic Shampoo', 'De-Shedding Conditioner',
  'Leave-in Conditioner Spray', 'Ear Cleaning Solution', 'Flea & Tick Shampoo',
  'Whitening Shampoo', 'Paw Balm', 'Pet Cologne'
];

const GroomingReportForm = ({ isOpen, appointment, onClose, onSaveSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    servicesPerformed: appointment?.selectedServices || [],
    productsUsed: [],
    coatCondition: 'Good',
    skinCondition: 'Healthy',
    behaviour: 'Calm',
    specialNotes: '',
    recommendedInterval: '4 weeks',
    nextGroomingDate: '',
    homeCareTips: ''
  });

  if (!isOpen || !appointment) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const array = prev[field];
      if (array.includes(item)) {
        return { ...prev, [field]: array.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...array, item] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Need api helper instance here or passed down. Assuming standard usage.
      const api = (await import('../../../utils/axios')).default;
      const res = await api.post(`/grooming/center/appointments/${appointment._id}/complete`, formData);
      
      if (res.data.success) {
        toast.success('Grooming completed and report saved!');
        onSaveSuccess();
      }
    } catch (error) {
      toast.error('Failed to complete grooming appointment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Complete Appointment</h2>
            <p className="text-sm text-gray-500">Grooming Report for {appointment.pet?.petName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="grooming-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Scissors size={16} className="text-primary" />
                Services Performed
              </h3>
              <div className="flex flex-wrap gap-2">
                {SERVICES_LIST.map(service => (
                  <button
                    type="button"
                    key={service}
                    onClick={() => toggleArrayItem('servicesPerformed', service)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                      formData.servicesPerformed.includes(service)
                        ? 'bg-primary/10 border-primary/20 text-primary'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Syringe size={16} className="text-green-500" />
                Products Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {PRODUCTS_LIST.map(product => (
                  <button
                    type="button"
                    key={product}
                    onClick={() => toggleArrayItem('productsUsed', product)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                      formData.productsUsed.includes(product)
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {product}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Coat Condition</label>
                <select name="coatCondition" value={formData.coatCondition} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary">
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair (Some Matting)">Fair (Some Matting)</option>
                  <option value="Poor (Severe Matting)">Poor (Severe Matting)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Skin Condition</label>
                <select name="skinCondition" value={formData.skinCondition} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary">
                  <option value="Healthy">Healthy</option>
                  <option value="Dry/Flaky">Dry/Flaky</option>
                  <option value="Oily">Oily</option>
                  <option value="Irritated/Red">Irritated/Red</option>
                  <option value="Hot Spots">Hot Spots</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Behaviour</label>
                <select name="behaviour" value={formData.behaviour} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary">
                  <option value="Calm">Calm & Cooperative</option>
                  <option value="Nervous">Nervous/Anxious</option>
                  <option value="Active">Very Active</option>
                  <option value="Aggressive">Aggressive/Difficult</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Recommended Next Visit</label>
                <select name="recommendedInterval" value={formData.recommendedInterval} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary">
                  <option value="2 weeks">2 weeks</option>
                  <option value="4 weeks">4 weeks</option>
                  <option value="6 weeks">6 weeks</option>
                  <option value="8 weeks">8 weeks</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Next Appointment Date</label>
                <input type="date" name="nextGroomingDate" value={formData.nextGroomingDate} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Stylist Notes</label>
              <textarea name="specialNotes" rows="3" value={formData.specialNotes} onChange={handleChange} placeholder="Any special remarks about the grooming session..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none"></textarea>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Home Care Tips for Owner</label>
              <textarea name="homeCareTips" rows="2" value={formData.homeCareTips} onChange={handleChange} placeholder="What should the owner do at home?" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none"></textarea>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-500" />
            This will update the pet's AI Grooming Profile automatically.
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" form="grooming-form" disabled={loading} className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark shadow-sm shadow-primary/20 flex items-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <CheckCircle2 size={16} />
              Complete Grooming
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default GroomingReportForm;
