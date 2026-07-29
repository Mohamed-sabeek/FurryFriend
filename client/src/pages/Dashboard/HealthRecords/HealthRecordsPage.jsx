import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, HeartPulse, Activity, Stethoscope } from 'lucide-react';
import api from '../../../utils/axios';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPets } from '../../../redux/slices/petSlice';
import AIHealthSummary from './components/AIHealthSummary';
import MedicalTimeline from './components/MedicalTimeline';
import AddRecordModal from './components/AddRecordModal';

const HealthRecordsPage = () => {
  const dispatch = useDispatch();
  const { pets, loading: petsLoading } = useSelector((state) => state.pets);
  
  const [selectedPet, setSelectedPet] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial fetch
  useEffect(() => {
    dispatch(fetchPets());
  }, [dispatch]);

  // Set default pet
  useEffect(() => {
    if (pets && pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0]);
    }
  }, [pets, selectedPet]);

  // Fetch timeline data when pet changes
  useEffect(() => {
    if (!selectedPet) return;
    
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/health-records/pet/${selectedPet._id}`);
        setTimelineData(res.data.data);
      } catch (err) {
        toast.error('Failed to load health records');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimeline();
  }, [selectedPet]);

  const handleRecordAdded = () => {
    // Refresh timeline data
    if (selectedPet) {
      api.get(`/health-records/pet/${selectedPet._id}`)
        .then(res => setTimelineData(res.data.data))
        .catch(() => toast.error('Failed to refresh data'));
    }
  };

  if (petsLoading || !pets) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <HeartPulse size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Pets Found</h2>
        <p className="text-gray-500 mb-6">Add a pet to your profile to start tracking their health.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header & Pet Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-text-heading flex items-center gap-2 mb-2">
            Health Records <Stethoscope className="text-primary" size={28} />
          </h1>
          <p className="text-gray-500 font-medium">Complete medical history and AI health insights.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white border border-gray-200 text-text-heading font-bold rounded-2xl px-5 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer flex items-center gap-2 w-40 justify-between"
            >
              <div className="flex items-center gap-2">
                {selectedPet ? (
                  <>
                    <span>{selectedPet.species === 'Dog' ? '🐶' : selectedPet.species === 'Cat' ? '🐱' : '🐾'}</span>
                    <span>{selectedPet.petName}</span>
                  </>
                ) : 'Select Pet'}
              </div>
              <ChevronDown className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={18} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50 py-2"
                >
                  {pets.map(pet => (
                    <button
                      key={pet._id}
                      onClick={() => {
                        setSelectedPet(pet);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-5 py-2.5 hover:bg-red-50 text-gray-700 hover:text-primary font-bold flex items-center gap-2 transition-colors"
                    >
                      <span>{pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : '🐾'}</span>
                      <span>{pet.petName}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary-light"
          >
            <Plus size={18} /> Add Record
          </button>
        </div>
      </div>

      {/* Full Screen Layout for AI Health Report */}
      <div className="w-full space-y-12">
        <AIHealthSummary pet={selectedPet} />
        
        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Medical History Timeline</h2>
          <MedicalTimeline 
            pet={selectedPet}
            timelineData={timelineData}
            loading={loading}
          />
        </div>
      </div>

      {/* Modals */}
      <AddRecordModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        petId={selectedPet?._id}
        onSuccess={handleRecordAdded}
      />
    </div>
  );
};

export default HealthRecordsPage;
