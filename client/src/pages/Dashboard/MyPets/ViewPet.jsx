import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPetById, clearSelectedPet } from '../../../redux/slices/petSlice';
import { ArrowLeft, Edit3, HeartPulse, ShieldCheck, Calendar, Activity, Info, AlertTriangle, Syringe, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import AddPetModal from '../../../components/pets/AddPetModal';
import MedicalReportModal from '../Appointments/components/MedicalReportModal';

const ViewPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedPet: pet, loading, error } = useSelector((state) => state.pets);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reportApptId, setReportApptId] = useState(null);

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

  useEffect(() => {
    if (id) {
      dispatch(getPetById(id));
    }
    return () => {
      dispatch(clearSelectedPet());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="bg-red-50 text-red-500 p-6 rounded-3xl text-center border border-red-100">
        <h3 className="font-bold text-xl mb-2">Oops! Something went wrong.</h3>
        <p>{error || 'Pet not found'}</p>
        <button 
          onClick={() => navigate('/dashboard/pets')}
          className="mt-4 px-6 py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard/pets')}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Pets
        </button>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Edit3 size={16} />
          Edit Profile
        </button>
      </div>

      {/* Hero Profile Section */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative">
        <div className="h-48 bg-gradient-to-r from-primary via-primary-light to-accent"></div>
        
        <div className="px-8 pb-8 flex flex-col md:flex-row gap-6 items-center md:items-end relative -mt-20">
          <div className="w-40 h-40 rounded-full border-4 border-white bg-white shadow-md overflow-hidden shrink-0 flex items-center justify-center">
            {pet.profileImage ? (
              <img src={pet.profileImage} alt={pet.petName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-300 font-bold text-4xl">{pet.petName[0]}</span>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left pt-4 md:pt-0">
            <h1 className="text-4xl font-poppins font-bold text-gray-800 mb-2">{pet.petName}</h1>
            <p className="text-lg text-gray-500 font-medium mb-4">
              {pet.breed ? `${pet.breed} • ` : ''}{pet.species} • {pet.gender}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 bg-secondary/10 text-secondary text-sm font-bold rounded-full flex items-center gap-1.5">
                <ShieldCheck size={16} />
                {pet.vaccinationStatus === 'Up to date' ? 'Fully Vaccinated' : 'Vaccination Needed'}
              </span>
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-full flex items-center gap-1.5">
                <Info size={16} />
                {pet.isNeutered ? 'Neutered/Spayed' : 'Intact'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Key Stats & Lifestyle */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Key Stats Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-poppins font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <Activity className="text-primary" size={20} />
              Key Stats
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Age</span>
                <span className="font-bold text-gray-800">{pet.dateOfBirth ? calculateAge(pet.dateOfBirth) : (pet.age !== undefined && pet.age !== null ? `${pet.age} years` : 'Unknown')}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Weight</span>
                <span className="font-bold text-gray-800">{pet.weight ? `${pet.weight} ${pet.weightUnit}` : 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Color</span>
                <span className="font-bold text-gray-800">{pet.color || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50 gap-2">
                <span className="text-gray-500 font-medium shrink-0">Microchip</span>
                <span className="font-semibold text-gray-700 text-sm break-all text-right">{pet.microchipNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Activity</span>
                <span className="font-bold text-gray-800">{pet.activityLevel}</span>
              </div>
            </div>
          </div>

          {/* Behavior & Lifestyle Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-6">
            <h3 className="font-poppins font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <Info className="text-secondary" size={20} />
              Behavior & Lifestyle
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Living Style</span>
                <span className="font-bold text-gray-800">{pet.livingStyle || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Temperament</span>
                <span className="font-bold text-gray-800">{pet.temperament || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <span className="text-gray-500 font-medium">Training</span>
                <span className="font-bold text-gray-800">{pet.trainingLevel || 'Unknown'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Hair Length</span>
                <span className="font-bold text-gray-800">{pet.hairLength || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Health & Notes */}
        <div className="lg:col-span-2 space-y-6">
          
          {pet.latestVisit && pet.latestVisit.date && (
            <div className="bg-gradient-to-br from-indigo-500 to-primary text-white rounded-3xl p-6 shadow-lg mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <HeartPulse size={120} />
              </div>
              <h3 className="font-poppins font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                <Activity size={20} />
                Latest Consultation
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Date</p>
                  <p className="font-bold">{new Date(pet.latestVisit.date).toLocaleDateString()}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20 col-span-2">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Diagnosis</p>
                  <p className="font-bold text-sm leading-snug">{pet.latestVisit.diagnosis || 'General Checkup'}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Doctor</p>
                  <p className="font-bold text-sm leading-snug">{pet.latestVisit.doctor?.startsWith('Dr.') ? pet.latestVisit.doctor : `Dr. ${pet.latestVisit.doctor || 'Vet'}`}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Weight</p>
                  <p className="font-bold">{pet.latestVisit.weight ? `${pet.latestVisit.weight} kg` : 'N/A'}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Temp</p>
                  <p className="font-bold">{pet.latestVisit.temperature ? `${pet.latestVisit.temperature}°` : 'N/A'}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20 col-span-2">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Next Follow-Up</p>
                  <p className="font-bold">{pet.latestVisit.nextFollowUp ? new Date(pet.latestVisit.nextFollowUp).toLocaleDateString() : 'None scheduled'}</p>
                </div>
              </div>
              
              {pet.latestVisit.appointmentId && (
                <div className="relative z-10 mt-5 pt-5 border-t border-white/20">
                  <button
                    onClick={() => setReportApptId(pet.latestVisit.appointmentId)}
                    className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm border border-white/30"
                  >
                    <FileText size={16} />
                    View Full Medical Report
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Health & Medical */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h3 className="font-poppins font-bold text-gray-800 text-xl mb-6 flex items-center gap-2">
              <ShieldCheck className="text-secondary" size={24} />
              Medical & Lifestyle
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} /> Allergies
                  </h4>
                  <p className="text-gray-800 font-medium bg-red-50/50 p-3 rounded-xl border border-red-100">
                    {pet.allergies || 'No known allergies reported.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Syringe size={16} /> Medications
                  </h4>
                  <p className="text-gray-800 font-medium bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    {pet.medications || 'No current medications.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Activity size={16} /> Previous Surgeries
                  </h4>
                  <p className="text-gray-800 font-medium bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                    {pet.previousSurgeries || 'No previous surgeries.'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText size={16} /> Conditions
                  </h4>
                  <p className="text-gray-800 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {pet.medicalConditions || 'No existing medical conditions.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <HeartPulse size={16} /> Diet & Feeding
                  </h4>
                  <p className="text-gray-800 font-medium bg-green-50/50 p-3 rounded-xl border border-green-100">
                    {pet.diet || 'Standard diet.'} {pet.mealsPerDay ? `(${pet.mealsPerDay} meals/day).` : ''} {pet.favoriteFood ? `Loves ${pet.favoriteFood}!` : ''}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ShieldCheck size={16} /> Current Veterinarian
                  </h4>
                  <p className="text-gray-800 font-medium bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                    {pet.currentVeterinarian || 'Not specified.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency History */}
          {pet.emergencyHistory && pet.emergencyHistory.length > 0 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-red-100 mt-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
              
              <h3 className="font-poppins font-bold text-gray-800 text-xl mb-6 flex items-center gap-2 relative z-10">
                <AlertTriangle className="text-red-500" size={24} />
                Emergency History
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {pet.emergencyHistory.map((hist, index) => (
                  <div key={index} className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center shadow-sm hover:border-red-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-50 p-2 rounded-lg text-red-500">
                        <Activity size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Emergency Incident</p>
                        <p className="text-xs text-gray-500 font-medium">{new Date(hist.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/dashboard/emergency')}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View Report
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {/* Other Info & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
              <h3 className="font-poppins font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <FileText className="text-accent" size={20} />
                Additional Info
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Adoption Date</span>
                  <span className="font-bold text-gray-800">{pet.adoptionDate ? new Date(pet.adoptionDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 font-medium">Emergency Contact</span>
                  <span className="font-bold text-gray-800">{pet.emergencyContact || 'None provided'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
              <h3 className="font-poppins font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <FileText className="text-primary" size={20} />
                Behavioral Notes
              </h3>
              {pet.notes ? (
                <p className="text-gray-600 font-inter leading-relaxed whitespace-pre-wrap">
                  {pet.notes}
                </p>
              ) : (
                <p className="text-gray-400 italic font-inter">No behavioral notes added.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Edit Pet Modal */}
      <AddPetModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        editData={pet} 
      />

      {reportApptId && (
        <MedicalReportModal
          isOpen={true}
          appointmentId={reportApptId}
          onClose={() => setReportApptId(null)}
        />
      )}
    </div>
  );
};

export default ViewPet;
