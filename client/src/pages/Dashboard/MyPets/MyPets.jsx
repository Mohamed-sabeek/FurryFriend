import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPets, deletePet } from '../../../redux/slices/petSlice';
import EmptyPetsState from '../../../components/pets/EmptyPetsState';
import PetGrid from '../../../components/pets/PetGrid';
import AddPetModal from '../../../components/pets/AddPetModal';
import { PlusCircle, Search, Filter, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MyPets = () => {
  const dispatch = useDispatch();
  const { pets, loading } = useSelector(state => state.pets);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [petToEdit, setPetToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Track initial modal state from URL for auto-opening
  const initialSpecies = searchParams.get('species');
  const returnTo = searchParams.get('returnTo');

  useEffect(() => {
    dispatch(fetchPets());
    
    if (searchParams.get('action') === 'add_pet') {
      setIsModalOpen(true);
      // We don't delete searchParams immediately because we want to pass them to AddPetModal.
      // But we can clear them when the modal closes.
    }
  }, [dispatch, searchParams]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (searchParams.has('action')) {
      searchParams.delete('action');
      searchParams.delete('species');
      searchParams.delete('returnTo');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleDeletePet = (pet) => {
    if (window.confirm(`Are you sure you want to delete ${pet.petName}? This action cannot be undone.`)) {
      dispatch(deletePet(pet._id));
    }
  };

  const handleEditPet = (pet) => {
    setPetToEdit(pet);
    setIsModalOpen(true);
  };

  // Filter and Sort Logic
  const filteredPets = useMemo(() => {
    let result = [...pets];
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(pet => 
        pet.petName?.toLowerCase().includes(lowerQuery) || 
        pet.breed?.toLowerCase().includes(lowerQuery) ||
        pet.species?.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (filterSpecies !== 'All') {
      result = result.filter(pet => pet.species === filterSpecies);
    }
    
    return result;
  }, [pets, searchQuery, filterSpecies]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-gray-800 mb-1">My Pets</h1>
          <p className="text-gray-500 font-inter">Manage all your furry family members in one place.</p>
        </div>
        <button 
          onClick={() => { setPetToEdit(null); setIsModalOpen(true); }}
          className="bg-primary text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all shadow-md shrink-0"
        >
          <PlusCircle size={20} />
          Add Pet
        </button>
      </div>

      {/* Content Area */}
      {loading && pets.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : pets.length === 0 ? (
        <EmptyPetsState onAddPet={() => { setPetToEdit(null); setIsModalOpen(true); }} />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search by name, breed, or species..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-primary/20 outline-none transition-all shadow-sm bg-white"
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  value={filterSpecies}
                  onChange={(e) => setFilterSpecies(e.target.value)}
                  className="pl-11 pr-8 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-primary/20 outline-none transition-all shadow-sm bg-white appearance-none cursor-pointer font-medium text-gray-700"
                >
                  <option value="All">All Species</option>
                  <option value="Dog">Dogs</option>
                  <option value="Cat">Cats</option>
                  <option value="Bird">Birds</option>
                  <option value="Rabbit">Rabbits</option>
                  <option value="Other">Others</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          {filteredPets.length > 0 ? (
            <PetGrid pets={filteredPets} onDeletePet={handleDeletePet} onEditPet={handleEditPet} />
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-poppins font-bold text-gray-800 mb-2">No matches found</h3>
              <p className="text-gray-500 font-inter">Try adjusting your search or filters to find what you're looking for.</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilterSpecies('All'); }}
                className="mt-6 text-primary font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Add / Edit Pet Modal */}
      <AddPetModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        editData={petToEdit}
        initialSpecies={!petToEdit && isModalOpen ? initialSpecies : null}
        returnTo={returnTo}
      />
    </div>
  );
};

export default MyPets;
