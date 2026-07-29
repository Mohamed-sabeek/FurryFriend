import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <div className="relative">
            <select
              value={selectedPet?._id || ''}
              onChange={(e) => setSelectedPet(pets.find(p => p._id === e.target.value))}
              className="appearance-none bg-white border border-gray-200 text-text-heading font-semibold rounded-2xl px-5 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer"
            >
              {pets.map(pet => (
                <option key={pet._id} value={pet._id}>
                  {pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : '🐾'} {pet.petName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={18} /> Add Record
          </button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Data & Timeline (Takes up 2/3 of space on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <MedicalTimeline 
            pet={selectedPet}
            timelineData={timelineData}
            loading={loading}
          />
        </div>

        {/* Right Column: AI Health Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AIHealthSummary petId={selectedPet?._id} refreshTrigger={timelineData} />
          </div>
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
