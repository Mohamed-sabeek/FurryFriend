import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Siren, Camera, Upload, X, Check, HeartPulse, 
  Activity, ShieldAlert, FileText, ChevronRight, Phone, Clock, 
  MapPin, Droplets, Bone, Flame, Eye, Skull, Download, Share2, Save,
  CheckCircle2, Calendar, ChevronDown, Star
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPets } from '../../../redux/slices/petSlice';
import toast from 'react-hot-toast';
import api from '../../../utils/axios';

const emergencyTypes = [
  { id: 'bleeding', label: 'Bleeding', icon: Droplets, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'vomiting', label: 'Vomiting', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'injury', label: 'Physical Injury', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'bite', label: 'Bite / Sting', icon: ShieldAlert, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'breathing', label: 'Breathing Problem', icon: HeartPulse, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'poisoning', label: 'Poisoning', icon: Skull, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'burn', label: 'Burn', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'bone', label: 'Broken Bone', icon: Bone, color: 'text-gray-600', bg: 'bg-gray-50' },
  { id: 'eye', label: 'Eye Injury', icon: Eye, color: 'text-teal-500', bg: 'bg-teal-50' },
  { id: 'other', label: 'Other', icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-100' },
];

const loadingSteps = [
  'Uploading images...',
  'Reading pet profile...',
  'Reading latest doctor consultation...',
  'Reading health report...',
  'AI analyzing emergency images...',
  'Detecting possible condition...',
  'Generating first aid...',
  'Preparing emergency report...'
];

const mockClinics = [
  { id: 1, name: 'Paws & Care Emergency Hospital', distance: '1.2 km', rating: 4.8, status: 'Open 24/7', image: '/src/assets/images/boarding-cover.png' },
  { id: 2, name: 'City Vet Critical Care', distance: '3.5 km', rating: 4.9, status: 'Open 24/7', image: '/src/assets/images/boarding-cover.png' }
];

const PetEmergencyPage = () => {
  const dispatch = useDispatch();
  const { pets } = useSelector(state => state.pets);
  
  const [selectedType, setSelectedType] = useState(null);
  const [images, setImages] = useState([]);
  const [rawImages, setRawImages] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notes, setNotes] = useState('');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    dispatch(fetchPets());
    fetchHistory();
  }, [dispatch]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/emergency/history');
      if (res.data.success) setHistory(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (pets && pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0]._id);
    }
  }, [pets, selectedPet]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      toast.error('Maximum 3 images allowed for analysis.');
      return;
    }
    
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
    setRawImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setRawImages(prev => prev.filter((_, i) => i !== index));
  };

  const startAnalysis = async () => {
    if (!selectedType) return toast.error('Please select an emergency type.');
    if (rawImages.length === 0) return toast.error('Please upload at least one photo.');
    if (!selectedPet) return toast.error('Please select a pet.');

    const formData = new FormData();
    formData.append('petId', selectedPet);
    formData.append('emergencyType', selectedType);
    formData.append('symptoms', JSON.stringify([])); // UI has no direct symptom selector yet besides type
    formData.append('notes', notes);
    rawImages.forEach(file => formData.append('images', file));

    setAnalyzing(true);
    setAnalysisStep(0);
    setResults(null);

    const progressInterval = setInterval(() => {
      setAnalysisStep(prev => prev < 7 ? prev + 1 : prev);
    }, 1500);

    try {
      const response = await api.post('/emergency/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      clearInterval(progressInterval);
      setAnalysisStep(8);
      
      const rep = response.data.data;
      setResults({
        severity: rep.severity === 'Critical' ? 9.5 : rep.severity === 'Moderate' ? 6.5 : 3.5,
        level: rep.severity,
        confidence: rep.confidence || 85,
        findings: rep.findings || [],
        firstAid: rep.firstAid || [],
        doNotDo: rep.avoid || [],
        checklist: (rep.firstAid || []).map((text, i) => ({ id: `c${i}`, text })),
        kit: rep.recommendedProducts || []
      });
      
      toast.success('Emergency Analysis Complete');
      fetchHistory();
      
      setTimeout(() => {
        setAnalyzing(false);
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      }, 1000);
    } catch (err) {
      clearInterval(progressInterval);
      setAnalyzing(false);
      const msg = err.response?.data?.message || 'Failed to analyze emergency.';
      const details = err.response?.data?.details ? `\nDetails: ${JSON.stringify(err.response.data.details)}` : '';
      toast.error(msg + details, { duration: 6000 });
    }
  };

  const toggleChecklist = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleViewReport = (hist) => {
    setResults({
      severity: hist.severity === 'Critical' ? 9.5 : hist.severity === 'Moderate' ? 6.5 : 3.5,
      level: hist.severity,
      confidence: hist.confidence || 85,
      findings: hist.findings || [],
      firstAid: hist.firstAid || [],
      doNotDo: hist.avoid || [],
      checklist: (hist.firstAid || []).map((text, i) => ({ id: `c${i}`, text })),
      kit: hist.recommendedProducts || []
    });
    
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 relative min-h-[calc(100vh-100px)]">
      
      <div className={`space-y-6 transition-all duration-300 ${analyzing ? 'opacity-40 blur-[2px] pointer-events-none' : ''}`}>
        {/* AI Warning Notice - Always at the top */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
        <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-bold text-yellow-800 text-sm">⚠ IMPORTANT NOTICE</h3>
          <p className="text-sm text-yellow-700 mt-1 font-medium">
            PetEmergency AI provides immediate first-aid guidance only. It is <strong>NOT</strong> a replacement for professional veterinary care. Always seek immediate medical attention for serious injuries.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-red-50 to-transparent pointer-events-none"></div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-xl text-red-600">
                <Siren size={28} />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">PetEmergency AI</h1>
            </div>
            <p className="text-gray-500 max-w-xl text-lg font-medium">
              Upload a photo of your pet during an emergency and receive immediate AI-powered first aid guidance until professional veterinary care is available.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm border border-red-100">
              <Clock size={18} /> 24/7 Emergency Support
            </div>
            <span className="text-xs font-bold text-gray-400 mt-2">Immediate Guidance</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Step 1: Select Emergency Type */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
              Select Emergency Type
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {emergencyTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-2xl flex items-center gap-3 transition-all duration-200 h-[76px] ${
                    selectedType === type.id 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 scale-[1.02] border-transparent' 
                      : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-red-200 hover:-translate-y-0.5'
                  }`}
                >
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${selectedType === type.id ? 'bg-white/20' : type.bg}`}>
                    <type.icon size={20} className={selectedType === type.id ? 'text-white' : type.color} />
                  </div>
                  <span className="font-bold text-sm text-left leading-tight">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Media Upload */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
              Upload Emergency Photos <span className="text-sm font-medium text-gray-400 ml-2 font-normal hidden sm:inline">(Max 3 photos)</span>
            </h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">Clear photos help the AI provide accurate first-aid. (Examples: wound close-up, full body)</p>

            <div className="flex flex-col sm:flex-row gap-4 h-auto sm:h-[200px]">
              <div className="flex-1 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-red-50/50 hover:border-red-200 transition-colors cursor-pointer group p-6" onClick={() => fileInputRef.current?.click()}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={28} className="text-red-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Browse Files</h3>
                <p className="text-sm text-gray-500 font-medium">or drag & drop here</p>
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="flex-1 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-red-50/50 hover:border-red-200 transition-colors cursor-pointer group p-6" onClick={() => cameraInputRef.current?.click()}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Camera size={28} className="text-red-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Take Photo</h3>
                <p className="text-sm text-gray-500 font-medium">Use device camera</p>
                <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-6 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <AnimatePresence>
                  {images.map((img, idx) => (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={idx} className="relative w-32 h-32 shrink-0 rounded-2xl overflow-hidden border-2 border-red-500 shadow-sm group">
                      <img src={img} alt="Upload" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Step 3 & 4: Pet & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                Select Pet
              </h2>
              <div className="relative">
                <div 
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 font-bold text-gray-800 transition-all cursor-pointer flex justify-between items-center"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>
                    {selectedPet 
                      ? (pets?.find(p => p._id === selectedPet)?.petName || "Unnamed Pet")
                      : <span className="text-gray-400 font-medium">Select the pet in emergency</span>
                    }
                  </span>
                  <ChevronDown size={20} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isDropdownOpen && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="max-h-60 overflow-y-auto py-2">
                      {pets?.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center font-medium">No pets found. Please add a pet first.</div>
                      ) : (
                        pets?.map(pet => (
                          <div 
                            key={pet._id}
                            className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${selectedPet === pet._id ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                            onClick={() => {
                              setSelectedPet(pet._id);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                              {pet.profileImage ? (
                                <img src={pet.profileImage} alt={pet.petName || 'Pet'} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg bg-gray-100">
                                  {(pet.petName || '?').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={`font-bold text-sm ${selectedPet === pet._id ? 'text-red-600' : 'text-gray-900'}`}>
                                {pet.petName || 'Unnamed Pet'}
                              </div>
                              <div className="text-xs text-gray-500 font-medium mt-0.5">
                                {pet.species}
                                {pet.breed ? ` • ${pet.breed}` : ''}
                                {pet.age ? ` • ${pet.age} Years` : ''}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
                Describe Situation
              </h2>
              <textarea 
                rows="2" 
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium outline-none transition-all resize-none"
                placeholder="Example: Stepped on broken glass..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Step 5: Analyze */}

          <button 
            onClick={startAnalysis}
            disabled={analyzing}
            className={`w-full font-extrabold text-xl py-5 rounded-2xl transition-all shadow-xl flex flex-col items-center justify-center gap-1 ${
              analyzing ? 'bg-gray-400 text-white cursor-not-allowed shadow-none' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/30 hover:-translate-y-1 active:translate-y-0'
            }`}
          >
            {analyzing ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 
                Analyzing...
              </span>
            ) : (
              <>
                <span>Analyze Emergency</span>
                <span className="text-sm font-medium text-red-200">Estimated Analysis Time: 10–20 seconds</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      </div> {/* End of blur wrapper */}

      {/* Loading Sequence Overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl text-center relative overflow-hidden pointer-events-auto">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Siren size={40} className="text-red-500 animate-pulse" />
                <svg className="absolute inset-0 w-full h-full text-red-500 animate-spin" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="150" strokeDashoffset="50" className="opacity-20"></circle>
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="300" strokeDashoffset="250" strokeLinecap="round"></circle>
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Emergency Analysis</h2>
              
              <div className="space-y-4 text-left">
                {loadingSteps.map((step, idx) => (
                  <div key={idx} className={`flex items-center gap-3 transition-all duration-500 ${idx <= analysisStep ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${idx < analysisStep ? 'bg-green-500 text-white' : idx === analysisStep ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-transparent'}`}>
                      {idx < analysisStep ? <Check size={14} /> : <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className={`font-bold text-sm ${idx === analysisStep ? 'text-red-600' : 'text-gray-700'}`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Dashboard */}
      {results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Analysis Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-600 text-white rounded-3xl p-8 shadow-xl md:col-span-2 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <AlertTriangle size={200} />
              </div>
              <div className="relative z-10">
                <h3 className="text-red-100 font-bold uppercase tracking-wider text-sm mb-2">Emergency Severity</h3>
                <div className="flex items-end gap-4 mb-4">
                  <h1 className="text-6xl font-extrabold">{results.severity}<span className="text-3xl text-red-200">/10</span></h1>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-200 rounded-full animate-pulse"></span> {results.level}
                  </span>
                </div>
                
                {/* Visual Meter */}
                <div className="w-full bg-red-900/50 h-3 rounded-full overflow-hidden mt-6">
                  <div className="h-full bg-white rounded-full w-[92%]"></div>
                </div>
                <div className="flex justify-between text-xs font-bold text-red-200 mt-2 uppercase tracking-wide">
                  <span>Minor</span>
                  <span>Moderate</span>
                  <span className="text-white">Critical</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="w-24 h-24 rounded-full border-8 border-green-500 flex items-center justify-center mb-4 relative">
                <span className="text-3xl font-extrabold text-gray-900">{results.confidence}%</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">AI Confidence</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Based on visual analysis and provided context.</p>
            </div>
          </div>

          {/* Timeline & Actions */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-6 justify-between items-center">
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 lg:pb-0">
              <div className="flex flex-col text-xs font-bold text-gray-500 shrink-0">
                <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={14}/> Image Uploaded</span>
                <span className="mt-1">10:32 PM</span>
              </div>
              <div className="w-8 h-0.5 bg-green-200 shrink-0 mx-2"></div>
              <div className="flex flex-col text-xs font-bold text-gray-500 shrink-0">
                <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={14}/> AI Analysis Completed</span>
                <span className="mt-1">10:32 PM</span>
              </div>
              <div className="w-8 h-0.5 bg-green-200 shrink-0 mx-2"></div>
              <div className="flex flex-col text-xs font-bold text-gray-500 shrink-0">
                <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={14}/> First Aid Generated</span>
                <span className="mt-1">10:33 PM</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200 shrink-0 mx-2"></div>
              <div className="flex flex-col text-xs font-bold text-gray-400 shrink-0">
                <span className="flex items-center gap-1"><Clock size={14}/> Emergency Appt Available</span>
                <span className="mt-1">10:34 PM</span>
              </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto shrink-0 flex-wrap justify-end">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <Share2 size={16} /> Share
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <Download size={16} /> PDF
              </button>
              <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 border border-red-100">
                <Save size={16} /> Save
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Findings & First Aid */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Findings */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="text-red-500" /> AI Diagnostic Findings
                </h2>
                <ul className="space-y-4">
                  {results.findings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="bg-white p-1 rounded-full shadow-sm shrink-0 mt-0.5">
                        <AlertTriangle size={16} className="text-orange-500" />
                      </div>
                      <span className="font-medium text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* First Aid Steps */}
              <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-lg shadow-red-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-10"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <HeartPulse className="text-red-500" size={28} /> Immediate First Aid Steps
                </h2>
                
                <div className="space-y-4 mb-8">
                  {results.firstAid.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0">
                        {idx + 1}
                      </div>
                      <p className="font-bold text-gray-800 text-sm md:text-base leading-tight">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Interactive Checklist */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Emergency Checklist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.checklist.map(item => (
                      <label key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checkedItems[item.id] ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${checkedItems[item.id] ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300'}`}>
                          {checkedItems[item.id] && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className={`font-bold text-sm ${checkedItems[item.id] ? 'text-green-800 line-through opacity-70' : 'text-gray-700'}`}>{item.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Warnings & Resources */}
            <div className="space-y-6">
              
              {/* DO NOT DO */}
              <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                  <X className="text-red-600" /> Things NOT To Do
                </h2>
                <ul className="space-y-3">
                  {results.doNotDo.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm font-bold text-red-700 bg-white/60 p-3 rounded-xl">
                      <span className="shrink-0">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nearest Clinics */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="text-primary" /> Nearest Emergency Vets
                </h2>
                <div className="space-y-4">
                  {mockClinics.map(clinic => (
                    <div key={clinic.id} className="border border-gray-100 rounded-2xl overflow-hidden group">
                      <div className="h-24 bg-gray-100 relative">
                        <img src={clinic.image} alt="Clinic" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                          {clinic.status}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{clinic.name}</h3>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><MapPin size={12}/> {clinic.distance}</span>
                          <span className="flex items-center gap-1 text-yellow-500"><Star size={12} className="fill-current"/> {clinic.rating}</span>
                        </div>
                        <button className="w-full mt-3 bg-primary text-white py-2 rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-1">
                          <Phone size={12} /> Call Clinic Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Kit */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldAlert className="text-blue-500" /> Required First Aid Kit
                </h2>
                <div className="flex flex-col gap-2">
                  {results.kit.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 flex items-center justify-between w-full">
                      {item}
                      <button className="text-primary hover:underline text-xs">View Product</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      )}

      {/* Emergency History */}
      {!results && !analyzing && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="text-gray-400" /> Previous Emergencies
          </h2>
          <div className="flex flex-col gap-4">
            {history.map(hist => (
              <div key={hist._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between group hover:border-red-200 transition-colors cursor-pointer gap-4">
                <div className="flex items-start md:items-center gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${hist.severity === 'Critical' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                    <Activity size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{hist.possibleCondition || hist.emergencyType}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${hist.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {hist.severity} Severity
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      <Calendar size={14} /> {new Date(hist.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${hist.status === 'Resolved' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {hist.status}
                  </span>
                  <button 
                    onClick={() => handleViewReport(hist)}
                    className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    View Report <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-gray-500 font-medium bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">No emergency history found.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PetEmergencyPage;
