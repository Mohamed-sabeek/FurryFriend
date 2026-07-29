import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { addPet, updatePet } from '../../redux/slices/petSlice';
import { X, ChevronRight, ChevronLeft, Upload, Loader2, Check, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

// Complex Schema covering all 5 steps
const petSchema = z.object({
  // STEP 1
  petName: z.string().min(1, 'Pet name is required'),
  species: z.enum(['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Turtle', 'Other'], {
    errorMap: () => ({ message: 'Please select a valid species' })
  }),
  breed: z.string().min(1, 'Breed is required'),
  isMixedBreed: z.boolean().default(false),
  gender: z.enum(['Male', 'Female', 'Unknown']),
  dateOfBirth: z.string().min(1, 'Date of Birth is required'),
  weight: z.string().min(1, 'Weight is required').refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Weight must be a positive number'
  }),
  weightUnit: z.enum(['kg', 'lbs']).default('kg'),
  color: z.string().optional(),

  // STEP 2
  vaccinationStatus: z.enum(['Up to date', 'Needs update', 'Unknown']).default('Unknown'),
  vaccinationDate: z.string().optional(),
  isNeutered: z.boolean().default(false),
  microchipNumber: z.string().optional(),
  allergies: z.union([z.array(z.string()), z.string()]).transform(val => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val).default([]),
  currentDiseases: z.union([z.array(z.string()), z.string()]).transform(val => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val).default([]),
  medications: z.string().optional(),
  previousSurgeries: z.string().optional(),
  currentVeterinarian: z.string().optional(),

  // STEP 3
  foodType: z.enum(['Dry', 'Wet', 'Homemade', 'Mixed', '']).default(''),
  favoriteFood: z.string().optional(),
  mealsPerDay: z.string().optional(),
  waterIntake: z.string().optional(),
  livingStyle: z.enum(['Indoor', 'Outdoor', 'Both', '']).default(''),
  activityLevel: z.enum(['Low', 'Moderate', 'High', 'Unknown']).default('Unknown'),
  favoriteActivities: z.array(z.string()).default([]),

  // STEP 4
  temperament: z.enum(['Friendly', 'Calm', 'Shy', 'Aggressive', 'Unknown', '']).default('Unknown'),
  trainingLevel: z.enum(['None', 'Basic', 'Intermediate', 'Advanced', '']).default(''),
  hairLength: z.enum(['Short', 'Medium', 'Long', 'Hairless', '']).default(''),
  sheddingLevel: z.enum(['Low', 'Medium', 'High', 'Unknown', '']).default('Unknown'),
  bathFrequency: z.string().optional(),
  nailTrimFrequency: z.string().optional(),
  notes: z.string().optional(),

  // STEP 5
  adoptionDate: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalNotes: z.string().optional(),
  aiPreferences: z.object({
    healthMonitoring: z.boolean(),
    dietRecommendations: z.boolean(),
    groomingSuggestions: z.boolean(),
    vaccinationReminders: z.boolean(),
    healthTrendAnalysis: z.boolean()
  }).default({
    healthMonitoring: true,
    dietRecommendations: true,
    groomingSuggestions: true,
    vaccinationReminders: true,
    healthTrendAnalysis: true
  })
});

const steps = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Health Profile' },
  { id: 3, title: 'Nutrition & Lifestyle' },
  { id: 4, title: 'Behavior & Grooming' },
  { id: 5, title: 'Additional Details' }
];

const DEFAULT_PET_VALUES = {
  petName: '', species: '', breed: '', isMixedBreed: false, gender: 'Unknown',
  dateOfBirth: '', weight: '', weightUnit: 'kg', color: '',
  vaccinationStatus: 'Unknown', vaccinationDate: '', isNeutered: false,
  microchipNumber: '', currentVeterinarian: '', allergies: [], currentDiseases: [],
  medications: '', previousSurgeries: '', foodType: '', favoriteFood: '', mealsPerDay: '',
  livingStyle: '', activityLevel: 'Unknown', favoriteActivities: [],
  temperament: 'Unknown', trainingLevel: '', hairLength: '', sheddingLevel: 'Unknown',
  bathFrequency: '', nailTrimFrequency: '', notes: '', adoptionDate: '',
  emergencyContact: '',
  aiPreferences: {
    healthMonitoring: true,
    dietRecommendations: true,
    groomingSuggestions: true,
    vaccinationReminders: true,
    healthTrendAnalysis: true
  }
};

const AddPetModal = ({ isOpen, onClose, editData, initialSpecies, returnTo }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [medicalReportFiles, setMedicalReportFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const { register, handleSubmit, formState: { errors }, trigger, reset, watch, setValue } = useForm({
    resolver: zodResolver(petSchema),
    defaultValues: { ...DEFAULT_PET_VALUES, species: initialSpecies || '' }
  });

  const formValues = watch();

  // Dynamic Profile Completion Calculation
  const isFilledStr = (val) => typeof val === 'string' ? val.trim().length > 0 : !!val;
  
  const completionFields = [
    { label: 'Name', isFilled: isFilledStr(formValues.petName), step: 1 },
    { label: 'Species', isFilled: isFilledStr(formValues.species), step: 1 },
    { label: 'Breed', isFilled: isFilledStr(formValues.breed), step: 1 },
    { label: 'Gender', isFilled: formValues.gender !== 'Unknown', step: 1 },
    { label: 'Date of Birth', isFilled: !!formValues.dateOfBirth, step: 1 },
    { label: 'Weight', isFilled: !!formValues.weight, step: 1 },
    { label: 'Color', isFilled: isFilledStr(formValues.color), step: 1 },
    { label: 'Photo', isFilled: !!(imageFile || imagePreview), step: 1 },
    { label: 'Vaccination Status', isFilled: formValues.vaccinationStatus !== 'Unknown', step: 2 },
    { label: 'Neutered/Spayed', isFilled: formValues.isNeutered, step: 2 },
    { label: 'Microchip', isFilled: isFilledStr(formValues.microchipNumber), step: 2 },
    { label: 'Veterinarian', isFilled: isFilledStr(formValues.currentVeterinarian), step: 2 },
    { label: 'Allergies', isFilled: formValues.allergies && formValues.allergies.length > 0, step: 2 },
    { label: 'Current Diseases', isFilled: formValues.currentDiseases && formValues.currentDiseases.length > 0, step: 2 },
    { label: 'Medications', isFilled: isFilledStr(formValues.medications), step: 2 },
    { label: 'Previous Surgeries', isFilled: isFilledStr(formValues.previousSurgeries), step: 2 },
    { label: 'Diet Type', isFilled: isFilledStr(formValues.foodType), step: 3 },
    { label: 'Meals Per Day', isFilled: !!formValues.mealsPerDay, step: 3 },
    { label: 'Living Style', isFilled: isFilledStr(formValues.livingStyle), step: 3 },
    { label: 'Activity Level', isFilled: formValues.activityLevel !== 'Unknown', step: 3 },
    { label: 'Temperament', isFilled: formValues.temperament !== 'Unknown', step: 4 },
    { label: 'Training Level', isFilled: isFilledStr(formValues.trainingLevel), step: 4 },
    { label: 'Hair Length', isFilled: isFilledStr(formValues.hairLength), step: 4 },
    { label: 'Behavioral Notes', isFilled: isFilledStr(formValues.notes), step: 4 },
    { label: 'Adoption Date', isFilled: !!formValues.adoptionDate, step: 5 },
    { label: 'Emergency Contact', isFilled: isFilledStr(formValues.emergencyContact), step: 5 },
    { label: 'Medical Reports', isFilled: medicalReportFiles.length > 0 || (editData?.medicalReports?.length > 0), step: 5 }
  ];

  if (formValues.vaccinationStatus === 'Up to date') {
    completionFields.push({ label: 'Vaccination Date', isFilled: !!formValues.vaccinationDate, step: 2 });
  }

  const completedItems = completionFields.filter(f => f.isFilled);
  const missingItems = completionFields.filter(f => !f.isFilled);
  
  // Calculate exact percentage
  useEffect(() => {
    setCompletionPercentage(Math.round((completedItems.length / completionFields.length) * 100));
  }, [completedItems.length, completionFields.length]);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Format dates for inputs
        // IMPORTANT: Merge editData with DEFAULT_PET_VALUES to guarantee missing fields overwrite old state
        const formatData = { ...DEFAULT_PET_VALUES, ...editData };
        if (formatData.dateOfBirth) formatData.dateOfBirth = formatData.dateOfBirth.split('T')[0];
        if (formatData.vaccinationDate) formatData.vaccinationDate = formatData.vaccinationDate.split('T')[0];
        if (formatData.adoptionDate) formatData.adoptionDate = formatData.adoptionDate.split('T')[0];
        if (formatData.weight) formatData.weight = formatData.weight.toString();
        if (formatData.mealsPerDay) formatData.mealsPerDay = formatData.mealsPerDay.toString();
        if (formatData.allergies && Array.isArray(formatData.allergies)) formatData.allergies = formatData.allergies.join(', ');
        if (formatData.currentDiseases && Array.isArray(formatData.currentDiseases)) formatData.currentDiseases = formatData.currentDiseases.join(', ');
        
        reset(formatData);
        if (formatData.profileImage) {
          setImagePreview(formatData.profileImage);
        }
      } else {
        // Reset to default with initialSpecies if provided
        reset({ ...DEFAULT_PET_VALUES, species: initialSpecies || '' });
        setImagePreview(null);
      }
      setCurrentStep(1);
    } else {
      // Clean up and completely reset form when closing to prevent state leakage
      reset({ ...DEFAULT_PET_VALUES, species: initialSpecies || '' });
      setImageFile(null);
      setImagePreview(null);
      setMedicalReportFiles([]);
    }
  }, [isOpen, editData, reset, initialSpecies]);

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMedicalReportsChange = (e) => {
    const files = Array.from(e.target.files);
    // Limit to 5 files, each under 5MB
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      toast.error('Some files were ignored because they exceed 5MB.');
    }
    setMedicalReportFiles(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) fieldsToValidate = ['petName', 'species', 'breed', 'gender', 'dateOfBirth', 'weight'];
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key === 'aiPreferences') {
          formData.append(key, JSON.stringify(data[key]));
        } else if (Array.isArray(data[key])) {
          // Send arrays as comma separated strings for FormData
          if (data[key].length > 0) {
            formData.append(key, data[key].join(','));
          } else {
            formData.append(key, ''); // Allow empty string so backend knows to clear the array
          }
        } else if (data[key] !== undefined && data[key] !== null) {
          // Allow empty strings to be sent to backend so it triggers $unset
          formData.append(key, data[key]);
        }
      });
      
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }
      
      medicalReportFiles.forEach(file => {
        formData.append('medicalReports', file);
      });
      
      if (editData) {
        await dispatch(updatePet({ id: editData._id, petData: formData })).unwrap();
      } else {
        await dispatch(addPet(formData)).unwrap();
      }
      if (returnTo === 'vetconnect') {
        navigate(`/dashboard/vetconnect?petRegistered=${data.species}`);
      } else {
        resetFormAndClose();
      }
    } catch (err) {
      // Error handled by redux slice
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFormAndClose = () => {
    reset(DEFAULT_PET_VALUES);
    setCurrentStep(1);
    setImagePreview(null);
    setImageFile(null);
    setMedicalReportFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetFormAndClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[24px] shadow-2xl w-full max-w-[900px] relative z-10 overflow-hidden flex flex-col h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
            <div>
              <h2 className="text-2xl font-poppins font-bold text-gray-800 flex items-center gap-2">
                🐾 {editData ? 'Edit Pet Profile' : 'Add New Pet'}
              </h2>
              <p className="text-gray-500 font-inter">{editData ? 'Update your pet\'s details and AI preferences.' : 'Let\'s create your pet\'s AI profile.'}</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Step {currentStep} of {steps.length}</p>
                <div className="w-32 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-primary h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
              </div>
              <button 
                onClick={resetFormAndClose}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form Content - Scrolling Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50/30 p-8 custom-scrollbar">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Column: Form */}
              <div className="flex-1">
                <form id="add-pet-form" onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
                  
                  {/* STEP 1: Basic Information */}
                  {currentStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <h3 className="text-xl font-poppins font-bold text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-gray-100 overflow-hidden relative group flex items-center justify-center cursor-pointer">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Upload size={32} className="text-gray-400 group-hover:text-primary transition-colors" />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold font-inter text-center px-2">Click to Upload<br/>(Max 5MB)</span>
                          </div>
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg, image/webp" 
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <div className="text-center sm:text-left">
                          <h4 className="font-bold text-gray-800">Profile Photo</h4>
                          <p className="text-sm text-gray-500">A clear photo helps the AI recognize your pet.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Pet Name *</label>
                          <input {...register('petName')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                          {errors.petName && <p className="text-red-500 text-xs mt-1">{errors.petName.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Species *</label>
                          <select {...register('species')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                            <option value="">Select Species</option>
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Bird">Bird</option>
                            <option value="Rabbit">Rabbit</option>
                            <option value="Fish">Fish</option>
                            <option value="Hamster">Hamster</option>
                            <option value="Turtle">Turtle</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.species && <p className="text-red-500 text-xs mt-1">{errors.species.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Breed *</label>
                          <input {...register('breed')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                          {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed.message}</p>}
                        </div>
                        <div className="space-y-1 flex flex-col justify-center pt-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register('isMixedBreed')} className="w-5 h-5 rounded text-primary focus:ring-primary" />
                            <span className="font-semibold text-gray-700">Mixed Breed?</span>
                          </label>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Gender *</label>
                          <select {...register('gender')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                            <option value="Unknown">Unknown</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Date of Birth *</label>
                          <input type="date" {...register('dateOfBirth')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                          {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Weight *</label>
                          <div className="flex gap-2">
                            <input type="number" step="0.1" {...register('weight')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" placeholder="0.0" />
                            <select {...register('weightUnit')} className="w-24 px-2 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                              <option value="kg">kg</option>
                              <option value="lbs">lbs</option>
                            </select>
                          </div>
                          {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Color</label>
                          <input {...register('color')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Health Profile */}
                  {currentStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <h3 className="text-xl font-poppins font-bold text-gray-800 border-b border-gray-200 pb-2">Health Profile</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Vaccination Status</label>
                          <select {...register('vaccinationStatus')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                            <option value="Unknown">Unknown</option>
                            <option value="Up to date">Up to date</option>
                            <option value="Needs update">Needs update</option>
                          </select>
                        </div>
                        
                        {formValues.vaccinationStatus === 'Up to date' && (
                          <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Last Vaccination Date</label>
                            <input type="date" {...register('vaccinationDate')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                          </div>
                        )}

                        <div className="space-y-1 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <input type="checkbox" {...register('isNeutered')} className="w-5 h-5 rounded text-primary" />
                            <span className="font-semibold text-gray-700">Neutered / Spayed?</span>
                          </label>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Microchip Number</label>
                          <input {...register('microchipNumber')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-semibold text-gray-700">Current Veterinarian (Clinic / Name)</label>
                          <input {...register('currentVeterinarian')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-semibold text-gray-700">Allergies (comma separated)</label>
                          <input {...register('allergies')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" placeholder="e.g. Peanuts, Dust, Chicken" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-semibold text-gray-700">Current Diseases (comma separated)</label>
                          <input {...register('currentDiseases')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" placeholder="e.g. Diabetes, Arthritis" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-semibold text-gray-700">Current Medications</label>
                          <textarea {...register('medications')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none h-20 resize-none" placeholder="List medications here..."></textarea>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-semibold text-gray-700">Previous Surgeries</label>
                          <textarea {...register('previousSurgeries')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none h-20 resize-none" placeholder="List surgeries here..."></textarea>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Nutrition & Lifestyle */}
                  {currentStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <h3 className="text-xl font-poppins font-bold text-gray-800 border-b border-gray-200 pb-2">Daily Lifestyle</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Food Type</label>
                          <select {...register('foodType')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                            <option value="">Select Type</option>
                            <option value="Dry">Dry Kibble</option>
                            <option value="Wet">Wet Food</option>
                            <option value="Homemade">Homemade / Raw</option>
                            <option value="Mixed">Mixed</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Favorite Food / Treats</label>
                          <input {...register('favoriteFood')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Meals Per Day</label>
                          <input type="number" {...register('mealsPerDay')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Water Intake Level</label>
                          <input {...register('waterIntake')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" placeholder="e.g. Low, High, 2 Bowls" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Activity Level</label>
                          <select {...register('activityLevel')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                            <option value="Unknown">Unknown</option>
                            <option value="Low">Low (Couch Potato)</option>
                            <option value="Moderate">Moderate (Daily Walks)</option>
                            <option value="High">High (Very Active)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Living Style</label>
                          <select {...register('livingStyle')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                            <option value="">Select Style</option>
                            <option value="Indoor">Indoor Only</option>
                            <option value="Outdoor">Outdoor / Yard</option>
                            <option value="Both">Indoor & Outdoor</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: Behavior & Grooming */}
                  {currentStep === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <h3 className="text-xl font-poppins font-bold text-gray-800 border-b border-gray-200 pb-2">Personality & Grooming</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Temperament</label>
                          <select {...register('temperament')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                            <option value="Unknown">Unknown</option>
                            <option value="Friendly">Friendly & Social</option>
                            <option value="Calm">Calm & Chill</option>
                            <option value="Shy">Shy / Timid</option>
                            <option value="Aggressive">Protective / Aggressive</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Training Level</label>
                          <select {...register('trainingLevel')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                            <option value="">Select Level</option>
                            <option value="None">None</option>
                            <option value="Basic">Basic (Sit, Stay)</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced / Guard</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Hair / Coat Length</label>
                          <select {...register('hairLength')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                            <option value="">Select Length</option>
                            <option value="Short">Short</option>
                            <option value="Medium">Medium</option>
                            <option value="Long">Long</option>
                            <option value="Hairless">Hairless</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Shedding Level</label>
                          <select {...register('sheddingLevel')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white">
                            <option value="Unknown">Unknown</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Bath Frequency</label>
                          <input {...register('bathFrequency')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" placeholder="e.g. Once a month" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Nail Trim Frequency</label>
                          <input {...register('nailTrimFrequency')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" placeholder="e.g. Every 2 weeks" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-semibold text-gray-700">Behavioral Notes</label>
                          <textarea {...register('notes')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none h-20 resize-none" placeholder="Any quirks or special notes..."></textarea>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 5: Additional Info */}
                  {currentStep === 5 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      <h3 className="text-xl font-poppins font-bold text-gray-800 border-b border-gray-200 pb-2">Extra Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Adoption / Gotcha Date</label>
                          <input type="date" {...register('adoptionDate')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-semibold text-gray-700">Emergency Contact</label>
                          <input {...register('emergencyContact')} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" placeholder="Name & Phone" />
                        </div>
                        
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-semibold text-gray-700">Upload Medical Reports (PDF/Images)</label>
                          <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <Upload className="text-gray-400 mb-2" size={24} />
                            <p className="text-sm font-medium text-gray-700">Click to upload up to 5 files</p>
                            <p className="text-xs text-gray-500">Max 5MB each.</p>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*, application/pdf"
                              onChange={handleMedicalReportsChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                          {medicalReportFiles.length > 0 && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {medicalReportFiles.map((f, i) => (
                                <div key={i} className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold text-gray-600">
                                  <FileText size={12} /> {f.name.length > 15 ? f.name.substring(0, 15) + '...' : f.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* AI Preferences */}
                        <div className="space-y-3 md:col-span-2 pt-4">
                          <label className="text-sm font-bold text-primary uppercase tracking-wider">AI Preferences</label>
                          <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['healthMonitoring', 'dietRecommendations', 'groomingSuggestions', 'vaccinationReminders', 'healthTrendAnalysis'].map(pref => (
                              <label key={pref} className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" {...register(`aiPreferences.${pref}`)} className="w-4 h-4 rounded text-primary" />
                                <span className="text-sm font-medium text-gray-700 capitalize">{pref.replace(/([A-Z])/g, ' $1').trim()}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>

              {/* Right Column: Profile Completion Card */}
              <div className="lg:w-72 shrink-0">
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 sticky top-0">
                  <h3 className="font-poppins font-bold text-gray-800 mb-4">Profile Completion</h3>
                  
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold text-primary">{completionPercentage}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-6">
                    <motion.div 
                      className="bg-primary h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                    />
                  </div>

                  <div className="space-y-4">
                    {completedItems.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Completed ({completedItems.length})</h4>
                        <ul className="space-y-2 text-sm text-gray-600 max-h-[160px] overflow-y-auto custom-scrollbar pr-2 pb-2 border-b border-gray-50">
                          {completedItems.map((item, i) => (
                            <li key={i} className="flex items-center gap-2"><Check size={14} className="text-green-500 shrink-0"/> <span className="truncate">{item.label}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {missingItems.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2 pt-2">Missing ({missingItems.length})</h4>
                        <ul className="space-y-2 text-sm text-gray-500 opacity-80 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                          {missingItems.map((item, i) => (
                            <li key={i} 
                                onClick={() => setCurrentStep(item.step)}
                                className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors py-0.5">
                              • <span className="truncate">{item.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-4 border-t border-gray-100 bg-white flex justify-between items-center sticky bottom-0 z-20">
            {currentStep > 1 ? (
              <button 
                type="button"
                onClick={prevStep}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            ) : (
              <button 
                type="button"
                onClick={resetFormAndClose}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-500 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}

            {currentStep < steps.length ? (
              <button 
                type="button"
                onClick={nextStep}
                className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark shadow-md hover:shadow-lg flex items-center gap-2 transition-all"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark shadow-md hover:shadow-lg flex items-center gap-2 transition-all disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Save Pet Profile
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default AddPetModal;
