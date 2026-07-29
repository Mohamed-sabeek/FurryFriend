import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Eye, ShieldCheck, HeartPulse, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PetCard = ({ pet, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      if (months === 0) return 'Newborn';
      return `${months} mo`;
    }
    return `${years} yr${years > 1 ? 's' : ''}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300"
    >
      {/* Top Section: Image and Badges */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-primary/10 shadow-sm relative flex items-center justify-center bg-orange-50 text-primary">
          {pet.profileImage ? (
            <img 
              src={pet.profileImage} 
              alt={pet.petName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <PawPrint size={40} />
          )}
        </div>
        
        <h3 className="text-xl font-poppins font-bold text-gray-800 text-center">
          {pet.petName}
        </h3>
        <p className="text-sm text-gray-500 font-medium mb-3 text-center">
          {pet.breed || pet.species} • {pet.gender}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
            {pet.species}
          </span>
          <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full flex items-center gap-1">
            <ShieldCheck size={12} />
            {pet.vaccinationStatus === 'Up to date' ? 'Vaccinated' : 'Check Vax'}
          </span>
          <span className="px-3 py-1 bg-accent/20 text-orange-600 text-xs font-bold rounded-full flex items-center gap-1">
            <HeartPulse size={12} />
            Healthy
          </span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 mb-4 flex-1">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Age</p>
          <p className="font-semibold text-gray-700 text-sm">
            {pet.dateOfBirth ? calculateAge(pet.dateOfBirth) : (pet.age !== undefined && pet.age !== null ? `${pet.age} yrs` : 'Unknown')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Weight</p>
          <p className="font-semibold text-gray-700 text-sm">
            {pet.weight ? `${pet.weight} ${pet.weightUnit || 'kg'}` : 'Unknown'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-auto">
        <button 
          onClick={() => navigate(`/dashboard/pets/${pet._id}`)}
          className="flex-1 bg-gray-50 hover:bg-primary hover:text-white text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors flex justify-center items-center gap-1"
        >
          <Eye size={16} />
          View
        </button>
        <button 
          onClick={() => onEdit(pet)}
          className="w-10 h-10 bg-gray-50 hover:bg-secondary hover:text-white text-gray-700 rounded-xl flex items-center justify-center transition-colors shrink-0"
        >
          <Edit3 size={18} />
        </button>
        <button 
          onClick={() => onDelete(pet)}
          className="w-10 h-10 bg-gray-50 hover:bg-red-500 hover:text-white text-gray-700 rounded-xl flex items-center justify-center transition-colors shrink-0"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default PetCard;
