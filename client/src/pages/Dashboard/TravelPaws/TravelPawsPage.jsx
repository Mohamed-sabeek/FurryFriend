import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Calendar, ShieldCheck, CheckCircle2, AlertTriangle, ChevronRight, Check, Search, ChevronDown, Dog, Plane } from 'lucide-react';
import api from '../../../utils/axios';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPets } from '../../../redux/slices/petSlice';
import toast from 'react-hot-toast';

const TravelPawsPage = () => {
  const { pets } = useSelector(state => state.pets);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  
  const dispatch = useDispatch();
  
  const [selectedPet, setSelectedPet] = useState(pets?.length > 0 ? pets[0]._id : null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [readinessReport, setReadinessReport] = useState(null);

  const [bookingCenter, setBookingCenter] = useState(null); // When a center is selected for booking
  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    duration: 0,
    estimatedCost: 0,
    specialInstructions: '',
    feedingInstructions: '',
    emergencyContact: ''
  });

  useEffect(() => {
    dispatch(fetchPets());
  }, [dispatch]);

  useEffect(() => {
    if (pets && pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0]._id);
    }
  }, [pets, selectedPet]);

  useEffect(() => {
    fetchCenters();
  }, [cityFilter]);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const url = cityFilter ? `/boarding/centers?city=${cityFilter}` : '/boarding/centers';
      const res = await api.get(url);
      if (res.data.success) {
        setCenters(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load boarding centers');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEligibility = async () => {
    if (!selectedPet) {
      toast.error('Please select a pet first');
      return;
    }
    setCheckingEligibility(true);
    setReadinessReport(null);
    try {
      const res = await api.get(`/travelpaws/plan/${selectedPet}`);
      if (res.data.success) {
        setReadinessReport(res.data.data);
      }
    } catch (error) {
      toast.error('TravelPaws AI failed to generate report');
    } finally {
      setCheckingEligibility(false);
    }
  };

  const calculateBookingDetails = (checkIn, checkOut, pricePerDay) => {
    let duration = 0;
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = end - start;
      if (diffTime > 0) {
        duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }
    
    setBookingData(prev => ({
      ...prev,
      checkInDate: checkIn || prev.checkInDate,
      checkOutDate: checkOut || prev.checkOutDate,
      duration: duration,
      estimatedCost: duration * pricePerDay
    }));
  };

  const submitBooking = async () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    try {
      const res = await api.post('/boarding/appointments', {
        petId: selectedPet,
        centerId: bookingCenter._id,
        ...bookingData
      });
      if (res.data.success) {
        toast.success('Boarding appointment requested successfully!');
        setBookingCenter(null);
      }
    } catch (error) {
      toast.error('Failed to book appointment');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              TravelPaws AI <Plane className="text-primary" size={28} />
            </h1>
          </div>
          <p className="text-gray-500 font-medium">Smart boarding recommendations and eligibility checks for your pets.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto relative z-20">
          
          {/* Custom Premium Dropdown */}
          <div className="relative flex-1 md:w-56">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-left shadow-sm group"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Dog size={12} className="text-primary" />
                </div>
                <span className="font-bold text-gray-700 truncate">
                  {selectedPet ? pets.find(p => p._id === selectedPet)?.petName : 'Select Pet'}
                </span>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 py-1"
                >
                  {pets.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 font-medium">No pets found.</div>
                  ) : (
                    pets.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => {
                          setSelectedPet(p._id);
                          setReadinessReport(null);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${
                          selectedPet === p._id ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-bold text-sm">{p.petName}</span>
                        {selectedPet === p._id && <Check size={16} className="text-primary" />}
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={handleCheckEligibility}
            disabled={checkingEligibility}
            className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {checkingEligibility ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : <ShieldCheck size={18} />}
            Check Eligibility
          </button>
        </div>
      </div>

      {/* Readiness Report Section */}
      <AnimatePresence>
        {readinessReport && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-8 border shadow-sm overflow-hidden relative ${
              readinessReport.isEligible ? 'bg-gradient-to-br from-green-50 to-emerald-50/30 border-green-100' : 'bg-gradient-to-br from-red-50 to-orange-50/30 border-red-100'
            }`}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              {readinessReport.isEligible ? <CheckCircle2 size={120} className="text-green-600" /> : <AlertTriangle size={120} className="text-red-600" />}
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {readinessReport.isEligible ? (
                    <div className="p-2 bg-green-100 rounded-xl text-green-600"><CheckCircle2 size={24} /></div>
                  ) : (
                    <div className="p-2 bg-red-100 rounded-xl text-red-600"><AlertTriangle size={24} /></div>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {readinessReport.isEligible ? 'Cleared for Boarding' : 'Not Eligible for Boarding'}
                  </h2>
                </div>

                {!readinessReport.isEligible ? (
                  <div className="bg-white/60 p-4 rounded-xl border border-red-200 text-red-800 font-medium flex items-start gap-3">
                    <AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-500" />
                    <p>{readinessReport.ineligibilityReason}</p>
                  </div>
                ) : (
                  <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                    TravelPaws AI has reviewed the health records and vaccination status. Everything looks perfect for a safe stay!
                  </p>
                )}

                {readinessReport.readinessReport && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/50 p-4 rounded-2xl border border-white">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Health Clearance</p>
                      <p className="font-semibold text-gray-800">{readinessReport.readinessReport.healthClearance}</p>
                    </div>
                    <div className="bg-white/50 p-4 rounded-2xl border border-white">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vaccination</p>
                      <p className="font-semibold text-gray-800">{readinessReport.readinessReport.vaccinationClearance}</p>
                    </div>
                  </div>
                )}
              </div>

              {readinessReport.isEligible && readinessReport.readinessReport?.packingChecklist && (
                <div className="md:w-80 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Check size={18} className="text-primary" />
                    Packing Checklist
                  </h3>
                  <ul className="space-y-3">
                    {readinessReport.readinessReport.packingChecklist.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boarding Centers List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recommended Centers</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search by city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
            />
          </div>
        </div>

        {loading ? (
           <div className="flex items-center justify-center h-32">
             <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : centers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-500 font-medium">No boarding centers found in this area.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {centers.map(center => (
              <div key={center._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  {/* Using default assets/images/boarding-cover.png which we copied */}
                  <img src={`/src/assets/images/${center.coverImage || 'boarding-cover.png'}`} alt={center.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {center.rating} ({center.reviewCount})
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={`/src/assets/images/${center.logo || 'boarding-logo.png'}`} alt="logo" className="w-10 h-10 rounded-xl object-cover border border-gray-100 shadow-sm" />
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight">{center.name}</h3>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {center.city}, {center.state}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 font-medium flex-1">{center.description}</p>
                  
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {center.facilities.slice(0, 3).map((f, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 rounded-lg text-[11px] font-bold text-gray-600 border border-gray-100">{f}</span>
                    ))}
                    {center.facilities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 rounded-lg text-[11px] font-bold text-gray-500 border border-gray-100">+{center.facilities.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Starting at</p>
                      <p className="text-lg font-bold text-gray-900">₹{center.dailyPrice}<span className="text-sm font-medium text-gray-400">/day</span></p>
                    </div>
                    <button 
                      onClick={() => {
                        if (!readinessReport) {
                          toast.error("Please run the TravelPaws Eligibility check first.");
                          return;
                        }
                        if (!readinessReport.isEligible) {
                          toast.error("Your pet is not eligible for boarding.");
                          return;
                        }
                        setBookingCenter(center);
                      }}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors text-sm flex items-center gap-1.5"
                    >
                      Book Now <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingCenter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setBookingCenter(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Book at {bookingCenter.name}</h2>
                  <p className="text-sm text-gray-500 font-medium">TravelPaws AI cleared your pet for boarding!</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Check In</label>
                    <input type="date" value={bookingData.checkInDate || ''} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" onChange={e => calculateBookingDetails(e.target.value, bookingData.checkOutDate, bookingCenter.dailyPrice)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Check Out</label>
                    <input type="date" value={bookingData.checkOutDate || ''} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" onChange={e => calculateBookingDetails(bookingData.checkInDate, e.target.value, bookingCenter.dailyPrice)} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Special Instructions (Optional)</label>
                  <textarea rows="2" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl resize-none" onChange={e => setBookingData(p => ({...p, specialInstructions: e.target.value}))}></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Emergency Contact</label>
                    <input type="text" placeholder="+91..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl" onChange={e => setBookingData(p => ({...p, emergencyContact: e.target.value}))} />
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 flex flex-col justify-center">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Estimated</p>
                    <p className="text-2xl font-bold text-blue-900">₹{bookingData.estimatedCost}</p>
                    <p className="text-xs text-blue-600/70 font-medium">{bookingData.duration} days</p>
                  </div>
                </div>

                <button onClick={submitBooking} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-sm">
                  Confirm Booking Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TravelPawsPage;
