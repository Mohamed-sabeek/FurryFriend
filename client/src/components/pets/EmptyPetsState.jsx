import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
// Assuming we have a pet illustration, or we can use a generic icon if not
import { PawPrint } from 'lucide-react';

const EmptyPetsState = ({ onAddPet }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-12 text-center shadow-soft border border-gray-100 flex flex-col items-center justify-center min-h-[400px]"
    >
      <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
        <PawPrint size={64} strokeWidth={1.5} />
      </div>
      
      <h3 className="text-2xl font-poppins font-bold text-gray-800 mb-2">
        No pets added yet
      </h3>
      
      <p className="text-gray-500 font-inter mb-8 max-w-md">
        Add your first pet to unlock personalized AI care, manage health records, and schedule vet appointments all in one place.
      </p>
      
      <button 
        onClick={onAddPet}
        className="bg-primary text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
      >
        <PlusCircle size={20} />
        Add Your First Pet
      </button>
    </motion.div>
  );
};

export default EmptyPetsState;
