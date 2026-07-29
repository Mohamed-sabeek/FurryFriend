import React from 'react';
import { useSelector } from 'react-redux';
import { Dog, Plus, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PetGrid = () => {
  const { data } = useSelector(state => state.dashboard);
  const pets = data?.pets || [];

  if (pets.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-poppins font-bold text-text-heading mb-6">My Pets</h2>
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <Dog size={48} />
          </div>
          <h3 className="text-xl font-poppins font-bold text-text-heading mb-2">You haven't added any pets yet</h3>
          <p className="text-text-body max-w-sm mb-6">
            Get started by adding your first furry friend to unlock personalized AI health tracking, nutrition plans, and more!
          </p>
          <button className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors shadow-glow flex items-center gap-2">
            <Plus size={20} />
            Add First Pet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-poppins font-bold text-text-heading">My Pets</h2>
        <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors p-2 rounded-lg flex items-center justify-center">
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={pet._id || idx} 
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                {/* Fallback to generic image if no photo */}
                <img 
                  src={`https://ui-avatars.com/api/?name=${pet.name}&background=FF6B6B&color=fff&size=128`} 
                  alt={pet.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-poppins font-bold text-text-heading">{pet.name}</h3>
                <p className="text-sm text-text-body">{pet.breed || pet.species}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    AI Score: {pet.aiHealthScore || 100}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <div>
                <p className="text-xs text-text-body">Next Vaccination</p>
                <p className="text-sm font-semibold text-text-heading">{pet.vaccinationStatus}</p>
              </div>
              <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-white transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PetGrid;
