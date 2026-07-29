import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Scissors, AlertTriangle, RefreshCw, ChevronDown, CheckCircle2, ListChecks, Calendar, Info, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '../../../components/ui/SectionHeader';
import StatCard from '../../../components/ui/StatCard';
import SummaryCard from '../../../components/ui/SummaryCard';
import api from '../../../utils/axios';
import toast from 'react-hot-toast';

const SPECIES_EMOJI = {
  Dog: '🐶', Cat: '🐱', Bird: '🐦', Rabbit: '🐰',
  Fish: '🐠', Hamster: '🐹', Turtle: '🐢', Other: '🐾'
};

const GroomEaseAIPage = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [plan, setPlan] = useState(null);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [bookingCenter, setBookingCenter] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPets = async () => {
    try {
      const res = await api.get('/pets');
      if (res.data.success && res.data.data.length > 0) {
        setPets(res.data.data);
        setSelectedPet(res.data.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCenters = async () => {
    try {
      const res = await api.get('/grooming/centers');
      if (res.data.success) {
        setCenters(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPets();
    fetchCenters();
  }, []);

  const fetchPlan = useCallback(async (petId) => {
    if (!petId) return;
    setLoading(true);
    try {
      const res = await api.get(`/grooming/${petId}/plan`);
      if (res.data.success) {
        setPlan(res.data.data);
        setIsStale(res.data.isStale || false);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setPlan(null);
        setIsStale(false);
      } else {
        console.error(err);
        toast.error('Failed to load grooming plan.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan(selectedPet);
  }, [selectedPet, fetchPlan]);

  const generatePlan = async () => {
    if (!selectedPet) return;
    setLoading(true);
    toast.loading('GroomEase AI is analyzing...', { id: 'grooming-gen' });
    try {
      const res = await api.post(`/grooming/${selectedPet}/generate`);
      if (res.data.success) {
        setPlan(res.data.data);
        setIsStale(false);
        toast.success('Grooming Plan Updated Successfully.', { id: 'grooming-gen' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate grooming plan.', { id: 'grooming-gen' });
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const date = formData.get('date');
    const time = formData.get('time');

    if(!date || !time) return toast.error('Please select date and time');

    try {
      await api.post('/grooming/book', {
        pet: selectedPet,
        center: bookingCenter._id,
        selectedServices: [plan?.recommendedStyle?.name || 'Full Grooming'],
        date,
        time
      });
      toast.success('Grooming Appointment Booked!');
      setBookingCenter(null);
    } catch (error) {
      toast.error('Booking failed');
    }
  };

  if (!pets.length && !loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-gray-800">No Pets Found</h2>
        <p className="text-gray-500 mt-2">Please add a pet in My Pets to generate a grooming plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader 
        title="GroomEase AI" 
        subtitle="Your intelligent pet grooming assistant."
        icon={Scissors}
      />

      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-64" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white border border-gray-200 text-gray-800 font-bold rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {(() => {
                const p = pets.find(pet => pet._id === selectedPet);
                if (p) return <><span className="text-xl">{SPECIES_EMOJI[p.species] || '🐾'}</span><span>{p.petName}</span></>;
                return 'Select Pet';
              })()}
            </div>
            <ChevronDown className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={18} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50 py-2"
              >
                {pets.map(p => (
                  <button
                    key={p._id}
                    onClick={() => { setSelectedPet(p._id); setIsDropdownOpen(false); }}
                    className="w-full text-left px-5 py-2.5 hover:bg-primary/5 text-gray-700 hover:text-primary font-bold flex items-center gap-2 transition-colors"
                  >
                    <span className="text-xl">{SPECIES_EMOJI[p.species] || '🐾'}</span>
                    <span>{p.petName}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button 
          onClick={generatePlan}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-bold shadow-sm hover:bg-primary-dark transition-colors"
        >
          <RefreshCw size={16} /> Generate Grooming Plan
        </button>
      </div>

      {isStale && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-blue-500" size={24} />
            <div>
              <p className="font-bold">A new medical assessment is available.</p>
              <p className="text-sm opacity-90">Your pet's medical information has changed.</p>
            </div>
          </div>
          <button 
            onClick={generatePlan}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Regenerate Grooming Plan
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="font-bold text-gray-800 text-lg">Generating Grooming Plan...</h3>
          <p className="text-gray-500 text-sm mt-1">Analyzing breed, coat type, and health records.</p>
        </div>
      ) : !plan ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <AlertTriangle size={48} className="text-orange-400 mb-4" />
          <h3 className="font-bold text-gray-800 text-lg">No Plan Available</h3>
          <p className="text-gray-500 text-sm mt-1 mb-4">Generate a grooming plan to get started.</p>
          <button onClick={generatePlan} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">Generate Plan</button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm border border-primary/10">
              <span className="text-2xl font-extrabold text-primary">{plan.groomingScore || 90}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Score</span>
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-primary-dark text-lg mb-1">Grooming Assessment</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{plan.overallSummary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3">
              <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-blue-800 text-sm mb-1">Coat & Skin Analysis</h4>
                <p className="text-sm text-blue-700 mb-2"><strong>Coat:</strong> {plan.coatAnalysis}</p>
                <p className="text-sm text-blue-700"><strong>Skin:</strong> {plan.skinAnalysis}</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex gap-3">
              <Scissors className="text-green-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-green-800 text-sm mb-1">Recommended Style</h4>
                <p className="text-sm font-bold text-green-900 mb-1">{plan.recommendedStyle?.name}</p>
                <p className="text-sm text-green-700">{plan.recommendedStyle?.reason}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SummaryCard title="Grooming Schedule" icon={Calendar}>
                <div className="mt-4 space-y-3">
                  {plan.schedule?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-100 p-3 rounded-xl">
                      <span className="font-bold text-gray-800">{item.task}</span>
                      <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">{item.frequency}</span>
                    </div>
                  ))}
                </div>
              </SummaryCard>

              <SummaryCard title="Hygiene Details" icon={ListChecks}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {[
                    { label: 'Ear Hygiene', value: plan.earHygiene },
                    { label: 'Eye Hygiene', value: plan.eyeHygiene },
                    { label: 'Dental Care', value: plan.dentalHygiene },
                    { label: 'Paw & Nail', value: plan.pawCondition + ' ' + plan.nailCondition }
                  ].map((h, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                      <span className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">{h.label}</span>
                      <span className="text-sm font-medium text-gray-800">{h.value}</span>
                    </div>
                  ))}
                </div>
              </SummaryCard>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <SummaryCard title="Recommended Products" icon={CheckCircle2}>
                <div className="space-y-3 mt-4">
                  {plan.recommendedProducts?.map((product, idx) => (
                    <div key={idx} className="bg-primary/5 border border-primary/10 p-3 rounded-xl flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-primary shrink-0" />
                      <span className="font-bold text-gray-800 text-sm">{product}</span>
                    </div>
                  ))}
                </div>
              </SummaryCard>
              
              <SummaryCard title="Professional Grooming" icon={Info}>
                <p className="text-sm text-gray-700 mt-2">{plan.professionalRequirement}</p>
              </SummaryCard>
            </div>
          </div>

          <div>
             <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Recommended Nearby Centers</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centers.slice(0, 4).map(center => (
                   <div key={center._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row">
                      <div className="w-full sm:w-1/3 h-32 sm:h-auto bg-gray-100 shrink-0">
                         <img src={center.images[0]} alt={center.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 flex flex-col justify-between w-full">
                         <div>
                            <div className="flex justify-between items-start">
                               <h4 className="font-bold text-gray-900 line-clamp-1">{center.name}</h4>
                               <span className="text-xs font-bold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-100">⭐ {center.rating}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12}/> {center.city}</p>
                         </div>
                         <button 
                            onClick={() => setBookingCenter(center)}
                            className="mt-3 w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
                         >
                            Book Appointment
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>

        </motion.div>
      )}

      {/* Booking Modal */}
      {bookingCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBookingCenter(null)} />
           <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Book Appointment</h2>
              <p className="text-sm text-gray-500 mb-4">at {bookingCenter.name}</p>
              
              <form onSubmit={handleBook} className="space-y-4">
                 <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 block mb-1">Pre-filled Data (GroomEase AI)</span>
                    <div className="text-sm font-bold text-gray-800 mb-1">Pet: {pets.find(p=>p._id===selectedPet)?.petName}</div>
                    <div className="text-sm font-bold text-gray-800">Style: {plan?.recommendedStyle?.name}</div>
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                    <input name="date" type="date" required className="w-full p-2 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm" />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                    <input name="time" type="time" required className="w-full p-2 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm" />
                 </div>

                 <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={() => setBookingCenter(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl font-bold">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-xl font-bold">Confirm Booking</button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default GroomEaseAIPage;
