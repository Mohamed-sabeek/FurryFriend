import React, { useState, useEffect } from 'react';
import { 
  Building2, Mail, Phone, MapPin, Map, Navigation, 
  Image as ImageIcon, Home, Save, X, RefreshCw,
  Clock, DollarSign, Users, ShieldCheck, Link, 
  AtSign, Globe, MessageCircle, Info, Star, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../utils/axios';

const ALL_SERVICES = ['Basic Boarding', 'Premium Suite', 'Daycare', 'Grooming included', 'Training', 'Pool Access', 'Webcam Access', 'Special Diet'];
const ALL_FACILITIES = ['Parking', 'Air Conditioned', 'Pet Play Area', 'Waiting Lounge', 'Pickup & Drop', 'Emergency Vet', 'CCTV Monitoring', 'Separate Cat Area', 'Outdoor Yard'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BoardingProfile = () => {
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
    logo: '', coverImage: '', description: '',
    weeklySchedule: DAYS.reduce((acc, day) => ({...acc, [day]: { open: '08:00', close: '20:00', isClosed: false }}), {}),
    services: [], pricing: [], 
    dailyPrice: 0, availableCapacity: 0, maximumCapacity: 0, facilities: [],
    socialLinks: { instagram: '', facebook: '', website: '', whatsapp: '' },
    rating: 4.9, reviewCount: 0, yearsExperience: 2, isVerified: false,
    isActive: true, galleryImages: []
  });

  const [stats, setStats] = useState({
    checkedIn: 22, completed: 15, pending: 5, cancelled: 1,
    revenue: '$3,400', rating: 4.9, avgStay: '4 days'
  });

  const getImageUrl = (imagePath, fallbackType) => {
    if (!imagePath || imagePath === 'default.jpg' || imagePath === 'default-logo.jpg' || imagePath === 'default-cover.jpg') {
      return fallbackType === 'cover' ? '/src/assets/images/boarding-cover.png' : '/src/assets/images/boarding-logo.png';
    }
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    
    // Support seed data images
    if (imagePath.startsWith('boarding') && imagePath.includes('.')) {
      return `/src/assets/images/${imagePath}`;
    }
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const coverImg = getImageUrl(profile.coverImage, 'cover');
  const logoImg = getImageUrl(profile.logo, 'logo') || getImageUrl(user?.profileImage, 'logo');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/boarding/center/profile');
      if (res.data.success && res.data.data) {
        setProfile(prev => ({
          ...prev,
          ...res.data.data,
          weeklySchedule: { ...prev.weeklySchedule, ...(res.data.data.weeklySchedule || {}) },
          socialLinks: { ...prev.socialLinks, ...(res.data.data.socialLinks || {}) }
        }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      showToast('Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put('/boarding/center/profile', profile);
      if (res.data.success) {
        showToast('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletion = () => {
    let fields = 0, filled = 0;
    const check = (val) => { fields++; if (val && val.toString().length !== 0) filled++; };
    
    check(profile.name); check(profile.phone); check(profile.address); check(profile.city);
    check(profile.description); check(profile.services?.length > 0); check(profile.dailyPrice > 0);
    check(profile.logo); check(profile.coverImage); check(profile.maximumCapacity > 0);
    
    return Math.round((filled / fields) * 100);
  };

  const completion = calculateCompletion();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
            <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 rounded-2xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg border flex items-center gap-3 transition-all ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
        <div className="h-72 bg-gray-900 relative rounded-t-2xl overflow-hidden">
          <img 
            src={coverImg} 
            alt="Cover" 
            className="w-full h-full object-cover transition-opacity duration-500 ease-in-out" 
            onError={(e) => { e.target.src = '/src/assets/images/boarding-cover.png'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
          
          <button className="absolute bottom-6 right-6 bg-white/90 backdrop-blur text-gray-900 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-white transition-all shadow-lg flex items-center gap-2 transform hover:scale-105">
            <ImageIcon size={18} /> Update Cover
          </button>
        </div>
        
        <div className="px-8 pb-8 pt-4 relative">
          <div className="absolute -top-20 left-8">
            <div className="w-40 h-40 bg-white rounded-full p-1.5 shadow-xl">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center border-4 border-white overflow-hidden relative group/logo">
                <img 
                  src={logoImg} 
                  alt="Logo" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.src = '/src/assets/images/boarding-logo.png'; }}
                />
                <div className="absolute inset-0 bg-black/60 hidden group-hover/logo:flex items-center justify-center text-white cursor-pointer transition-all backdrop-blur-sm">
                  <ImageIcon size={28} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="ml-48 flex justify-between items-start mt-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profile.name || 'Boarding Center'}</h1>
                {profile.isVerified && (
                  <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-200 shadow-sm">
                    <ShieldCheck size={14} /> Verified Boarding Center
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1.5 font-bold text-yellow-500 bg-yellow-50 px-2.5 py-1 rounded-lg">
                  <Star size={16} className="fill-current" /> {profile.rating} <span className="text-gray-500 font-medium">({profile.reviewCount} Reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Users size={16} className="text-gray-400" /> {profile.maximumCapacity} Pet Capacity
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock size={16} className="text-gray-400" /> {profile.yearsExperience} Years Exp.
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-2">
                   <MapPin size={16} className="text-primary" />
                   {profile.address}, {profile.city}
                </div>
                <div className="flex items-center gap-2">
                   <Phone size={16} className="text-primary" />
                   {profile.phone}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-gray-500 mb-1">Profile Completion</div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${completion}%` }}></div>
                </div>
                <span className="text-sm font-bold text-gray-700">{completion}%</span>
              </div>
              {completion < 100 && (
                <div className="text-xs text-orange-500 mt-1 flex items-center justify-end gap-1">
                  <AlertCircle size={12} /> Add more details to reach 100%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Business Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Building2 size={20} className="text-primary" /> Business Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Center Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Building2 size={16}/></div>
                  <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={16}/></div>
                  <input type="email" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Phone size={16}/></div>
                  <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><MapPin size={16}/></div>
                  <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Map size={16}/></div>
                    <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State / Pincode</label>
                  <div className="flex gap-2 relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10"><Navigation size={16}/></div>
                    <input type="text" placeholder="State" className="w-1/2 pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" value={profile.state || ''} onChange={e => setProfile({...profile, state: e.target.value})} />
                    <input type="text" placeholder="Zip" className="w-1/2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium" value={profile.pincode || ''} onChange={e => setProfile({...profile, pincode: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Center */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Info size={20} className="text-primary" /> About Center
            </h2>
            <textarea 
              rows={4} 
              placeholder="Tell pet parents about your boarding center, experience, and what makes you special..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-gray-700 leading-relaxed resize-none outline-none"
              value={profile.description || ''} 
              onChange={e => setProfile({...profile, description: e.target.value})}
            />
          </div>

          {/* Services & Pricing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <DollarSign size={20} className="text-primary" /> Services & Pricing
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Services Offered</label>
              <div className="flex flex-wrap gap-2">
                {ALL_SERVICES.map(service => {
                  const isSelected = profile.services?.includes(service);
                  return (
                    <button
                      key={service}
                      onClick={() => {
                        const newServices = isSelected 
                          ? profile.services.filter(s => s !== service)
                          : [...(profile.services || []), service];
                        setProfile({...profile, services: newServices});
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                        isSelected ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={14} />}
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
               <div className="flex justify-between items-center mb-4">
                 <label className="block text-sm font-medium text-gray-700">Add-on Packages Pricing</label>
                 <button 
                  onClick={() => setProfile({...profile, pricing: [...(profile.pricing || []), { serviceName: '', price: 0 }]})}
                  className="text-sm text-primary font-medium hover:text-primary-hover flex items-center gap-1"
                 >
                   + Add Price Package
                 </button>
               </div>
               
               <div className="space-y-3">
                 <div className="flex gap-3 items-center bg-gray-50 p-2 rounded-xl border border-gray-200 border-l-4 border-l-primary">
                    <div className="flex-1 px-3 text-sm font-medium text-gray-700">
                      Standard Daily Boarding Rate
                    </div>
                    <div className="w-32 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><DollarSign size={14}/></div>
                       <input 
                        type="number" 
                        placeholder="50"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={profile.dailyPrice || 0}
                        onChange={(e) => setProfile({...profile, dailyPrice: Number(e.target.value)})}
                       />
                     </div>
                     <div className="w-8"></div>
                 </div>

                 {profile.pricing?.map((pkg, idx) => (
                   <div key={idx} className="flex gap-3 items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                     <div className="flex-1 relative">
                       <input 
                        type="text" 
                        placeholder="E.g. VIP Suite Upgrade"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={pkg.serviceName}
                        onChange={(e) => {
                          const newPricing = [...profile.pricing];
                          newPricing[idx].serviceName = e.target.value;
                          setProfile({...profile, pricing: newPricing});
                        }}
                       />
                     </div>
                     <div className="w-32 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><DollarSign size={14}/></div>
                       <input 
                        type="number" 
                        placeholder="25"
                        className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        value={pkg.price}
                        onChange={(e) => {
                          const newPricing = [...profile.pricing];
                          newPricing[idx].price = Number(e.target.value);
                          setProfile({...profile, pricing: newPricing});
                        }}
                       />
                     </div>
                     <button 
                      onClick={() => {
                        const newPricing = profile.pricing.filter((_, i) => i !== idx);
                        setProfile({...profile, pricing: newPricing});
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                     >
                       <X size={16} />
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <ShieldCheck size={20} className="text-primary" /> Facilities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ALL_FACILITIES.map(facility => (
                <label key={facility} className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 border-2 border-gray-300 rounded peer checked:bg-primary checked:border-primary cursor-pointer transition-all appearance-none"
                      checked={profile.facilities?.includes(facility) || false}
                      onChange={(e) => {
                        const newFac = e.target.checked 
                          ? [...(profile.facilities || []), facility]
                          : profile.facilities.filter(f => f !== facility);
                        setProfile({...profile, facilities: newFac});
                      }}
                    />
                    <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{facility}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Statistics Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl pointer-events-none"></div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 relative z-10">
              <Star size={20} className="text-yellow-400" /> Current Stays Overview
            </h2>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="text-white/60 text-xs font-medium mb-1">Checked In</div>
                <div className="text-2xl font-bold">{stats.checkedIn}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="text-white/60 text-xs font-medium mb-1">Completed</div>
                <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="text-white/60 text-xs font-medium mb-1">Pending</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="text-white/60 text-xs font-medium mb-1">Est. Revenue</div>
                <div className="text-2xl font-bold">{stats.revenue}</div>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
              <Clock size={20} className="text-primary" /> Working Hours
            </h2>
            <div className="space-y-3">
              {DAYS.map(day => (
                <div key={day} className="flex items-center justify-between group">
                  <label className="flex items-center gap-2 w-28 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      checked={!profile.weeklySchedule[day]?.isClosed}
                      onChange={(e) => {
                        setProfile({
                          ...profile, 
                          weeklySchedule: {
                            ...profile.weeklySchedule,
                            [day]: { ...profile.weeklySchedule[day], isClosed: !e.target.checked }
                          }
                        });
                      }}
                    />
                    <span className={`text-sm font-medium ${profile.weeklySchedule[day]?.isClosed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{day.substring(0,3)}</span>
                  </label>
                  
                  {!profile.weeklySchedule[day]?.isClosed ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="time" 
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 focus:bg-white outline-none"
                        value={profile.weeklySchedule[day]?.open || '09:00'}
                        onChange={(e) => {
                          setProfile({
                            ...profile, 
                            weeklySchedule: {
                              ...profile.weeklySchedule,
                              [day]: { ...profile.weeklySchedule[day], open: e.target.value }
                            }
                          });
                        }}
                      />
                      <span className="text-gray-400">-</span>
                      <input 
                        type="time" 
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 focus:bg-white outline-none"
                        value={profile.weeklySchedule[day]?.close || '19:00'}
                        onChange={(e) => {
                          setProfile({
                            ...profile, 
                            weeklySchedule: {
                              ...profile.weeklySchedule,
                              [day]: { ...profile.weeklySchedule[day], close: e.target.value }
                            }
                          });
                        }}
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-red-500 bg-red-50 px-3 py-1 rounded-lg">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Capacity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Users size={20} className="text-primary" /> Facility Capacity
            </h2>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-gray-700">Max Capacity</div>
                <div className="text-xs text-gray-500">Maximum pets at once</div>
              </div>
              <input 
                type="number" 
                className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center font-bold focus:border-primary outline-none"
                value={profile.maximumCapacity || 0}
                onChange={e => setProfile({...profile, maximumCapacity: Number(e.target.value)})}
              />
            </div>
            <div className="flex justify-between text-sm px-1">
              <span className="text-gray-500">Currently Boarded: <span className="font-bold text-gray-900">{stats.checkedIn}</span></span>
              <span className="text-gray-500">Available: <span className="font-bold text-green-600">{Math.max(0, (profile.maximumCapacity || 0) - stats.checkedIn)}</span></span>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
              <Globe size={20} className="text-primary" /> Social Links
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-500"><AtSign size={16}/></div>
                <input type="text" placeholder="Instagram Profile URL" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white text-sm outline-none focus:border-primary" value={profile.socialLinks?.instagram || ''} onChange={e => setProfile({...profile, socialLinks: {...profile.socialLinks, instagram: e.target.value}})} />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-600"><Link size={16}/></div>
                <input type="text" placeholder="Facebook Page URL" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white text-sm outline-none focus:border-primary" value={profile.socialLinks?.facebook || ''} onChange={e => setProfile({...profile, socialLinks: {...profile.socialLinks, facebook: e.target.value}})} />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-500"><MessageCircle size={16}/></div>
                <input type="text" placeholder="WhatsApp Number" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white text-sm outline-none focus:border-primary" value={profile.socialLinks?.whatsapp || ''} onChange={e => setProfile({...profile, socialLinks: {...profile.socialLinks, whatsapp: e.target.value}})} />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600"><Globe size={16}/></div>
                <input type="text" placeholder="Website URL" className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white text-sm outline-none focus:border-primary" value={profile.socialLinks?.website || ''} onChange={e => setProfile({...profile, socialLinks: {...profile.socialLinks, website: e.target.value}})} />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-end mt-8 mb-10 mr-2">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-8 py-3.5 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/30 text-base flex items-center justify-center gap-2.5 disabled:opacity-70 hover:-translate-y-0.5 active:translate-y-0"
        >
          {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Saving Profile...' : 'Save Profile'}
        </button>
      </div>

    </div>
  );
};

export default BoardingProfile;
