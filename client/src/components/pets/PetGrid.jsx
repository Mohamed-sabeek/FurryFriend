import React from 'react';
import PetCard from './PetCard';

const PetGrid = ({ pets, onDeletePet, onEditPet }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pets.map((pet) => (
        <PetCard 
          key={pet._id} 
          pet={pet} 
          onDelete={() => onDeletePet(pet)}
          onEdit={() => onEditPet(pet)}
        />
      ))}
    </div>
  );
};

export default PetGrid;
