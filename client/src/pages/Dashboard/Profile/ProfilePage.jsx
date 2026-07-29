import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit3, ShieldCheck, Shield, Calendar, Hash, Save, X, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile } from '../../../redux/slices/authSlice';
import api from '../../../utils/axios';
import toast from 'react-hot-toast';
import SectionHeader from '../../../components/ui/SectionHeader';
import SummaryCard from '../../../components/ui/SummaryCard';
import { format } from 'date-fns';
import { useRef } from 'react';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { user } = useSelector(state => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Address sub-form
  const [addressData, setAddressData] = useState({
    _id: '',
    houseNumber: '',
    street: '',
    area: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    pincode: '',
    landmark: ''
  });

  // Basic info sub-form
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dob: '',
    gender: ''
  });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        gender: user.gender || ''
      });

      const defaultAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        setAddressData({
          _id: defaultAddr._id,
          houseNumber: defaultAddr.houseNumber || '',
          street: defaultAddr.street || '',
          area: defaultAddr.area || '',
          city: defaultAddr.city || '',
          district: defaultAddr.district || '',
          state: defaultAddr.state || '',
          country: defaultAddr.country || 'India',
          pincode: defaultAddr.pincode || '',
          landmark: defaultAddr.landmark || ''
        });
      }
    }
  }, [user]);

  const handleBasicChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (formData.fullName.length < 3) {
      toast.error("Full Name must be at least 3 characters");
      return false;
    }
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return false;
    }
    if (addressData.pincode && !/^\d{6}$/.test(addressData.pincode)) {
      toast.error("Pincode must be exactly 6 digits");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      // Update basic info
      await api.put('/profile', formData);
      
      // Update address if fields are filled
      if (addressData.city && addressData.state) {
         await api.put('/profile/address', {
           ...addressData,
           addressId: addressData._id || undefined,
           isDefault: true,
           label: 'Home'
         });
      }

      dispatch(fetchProfile());
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading('Uploading image...');
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      await api.patch('/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      dispatch(fetchProfile());
      toast.success('Profile picture updated!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image.', { id: toastId });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to user state
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        gender: user.gender || ''
      });
      const defaultAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        setAddressData({
          _id: defaultAddr._id,
          houseNumber: defaultAddr.houseNumber || '',
          street: defaultAddr.street || '',
          area: defaultAddr.area || '',
          city: defaultAddr.city || '',
          district: defaultAddr.district || '',
          state: defaultAddr.state || '',
          country: defaultAddr.country || 'India',
          pincode: defaultAddr.pincode || '',
          landmark: defaultAddr.landmark || ''
        });
      }
    }
  };

  if (!user) return <div className="p-8 text-center text-gray-500">Loading Profile...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <SectionHeader 
        title="My Profile" 
        subtitle="Manage your personal and shipping information."
        icon={User}
      />

      <div className="flex justify-end mb-6">
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={handleCancel}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 font-bold px-6 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
            >
              <X size={18} /> Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-primary-dark transition-all disabled:opacity-70"
            >
              <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - User Card & Account Info */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="h-32 bg-gradient-to-r from-primary/80 to-blue-400 relative"></div>
            <div className="px-6 pb-6 text-center -mt-16">
              <div 
                className={`w-32 h-32 mx-auto bg-white rounded-full p-1 border-4 border-white shadow-md relative mb-4 group ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <img 
                  src={user.profileImage === 'default.jpg' ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}` : user.profileImage} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full bg-blue-50 object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="text-white" size={24} />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-black text-gray-800">{user.fullName}</h2>
              <p className="text-gray-500 font-medium mb-4 flex items-center justify-center gap-1">
                {user.isVerified ? (
                  <><ShieldCheck size={16} className="text-green-500" /> Verified Member</>
                ) : (
                  <span className="text-orange-400">Unverified Member</span>
                )}
              </p>
            </div>
          </motion.div>

          <SummaryCard title="Account Information" icon={Shield}>
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-500"><Hash size={16} /> Customer ID</div>
                <div className="font-bold text-gray-800 text-sm">{user._id.slice(-8).toUpperCase()}</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-500"><Mail size={16} /> Registered Email</div>
                <div className="font-bold text-gray-800 text-sm">{user.email}</div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-500"><Calendar size={16} /> Member Since</div>
                <div className="font-bold text-gray-800 text-sm">{user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}</div>
              </div>
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2 text-gray-500"><ShieldCheck size={16} /> Role</div>
                <div className="font-bold text-primary uppercase text-sm tracking-wider">{user.role}</div>
              </div>
            </div>
          </SummaryCard>
        </div>

        {/* Right Column - Forms & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          <SummaryCard title="Basic & Contact Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleBasicChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-transparent bg-gray-50 font-medium text-gray-500 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleBasicChange}
                    disabled={!isEditing}
                    placeholder="10-digit mobile number"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob"
                  value={formData.dob}
                  onChange={handleBasicChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleBasicChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </SummaryCard>

          <SummaryCard title="Default Delivery Address" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">House / Flat Number</label>
                <input 
                  type="text" 
                  name="houseNumber"
                  value={addressData.houseNumber}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                <input 
                  type="text" 
                  name="street"
                  value={addressData.street}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Area / Locality</label>
                <input 
                  type="text" 
                  name="area"
                  value={addressData.area}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Landmark (Optional)</label>
                <input 
                  type="text" 
                  name="landmark"
                  value={addressData.landmark}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <input 
                  type="text" 
                  name="city"
                  value={addressData.city}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">District</label>
                <input 
                  type="text" 
                  name="district"
                  value={addressData.district}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                <input 
                  type="text" 
                  name="state"
                  value={addressData.state}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pincode</label>
                <input 
                  type="text" 
                  name="pincode"
                  value={addressData.pincode}
                  onChange={handleAddressChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border font-medium text-gray-800 transition-all ${isEditing ? 'border-gray-200 focus:ring-2 focus:ring-primary/20 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'}`} 
                />
              </div>
            </div>
          </SummaryCard>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
