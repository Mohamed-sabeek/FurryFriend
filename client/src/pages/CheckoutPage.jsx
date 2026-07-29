import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../redux/slices/orderSlice';
import { fetchProfile } from '../redux/slices/authSlice';
import { ShieldCheck, Truck, CreditCard, Save } from 'lucide-react';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery');
  const [saveAddressOption, setSaveAddressOption] = useState('use-only'); // 'use-only' or 'update-default'

  useEffect(() => {
    if (!cart?.items?.length) {
      navigate('/commerce/cart');
    }
    dispatch(fetchProfile());
  }, [cart, navigate, dispatch]);

  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      
      let fullAddress = '';
      if (defaultAddr) {
        fullAddress = [defaultAddr.houseNumber, defaultAddr.street, defaultAddr.area].filter(Boolean).join(', ');
      }

      setFormData(prev => ({
        ...prev,
        name: user.fullName || prev.name,
        phone: user.phone || prev.phone,
        address: fullAddress || prev.address,
        city: defaultAddr?.city || prev.city,
        state: defaultAddr?.state || prev.state,
        pincode: defaultAddr?.pincode || prev.pincode
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user chose to update default address
    if (saveAddressOption === 'update-default') {
      try {
        await api.put('/profile/address', {
          isDefault: true,
          label: 'Home',
          houseNumber: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        });
        // Optionally update phone if it changed
        await api.put('/profile', { phone: formData.phone });
        dispatch(fetchProfile());
      } catch (err) {
        console.error("Failed to update default profile address", err);
      }
    }

    dispatch(createOrder({ shippingAddress: formData, paymentMethod }))
      .unwrap()
      .then((order) => {
        toast.success('Order placed successfully!');
        navigate('/commerce/orders');
      })
      .catch((err) => toast.error(err));
  };

  const deliveryCharge = 50;
  const subtotal = cart?.subtotal || 0;
  const total = subtotal + deliveryCharge;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6"><Truck className="text-emerald-500" /> Shipping Address</h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <textarea required rows="2" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input required type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors" />
              </div>

              <div className="md:col-span-2 mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col gap-3">
                <div className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                  <Save size={16} className="text-emerald-600" /> Save this address?
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="radio" 
                    name="saveOption" 
                    value="use-only" 
                    checked={saveAddressOption === 'use-only'} 
                    onChange={(e) => setSaveAddressOption(e.target.value)} 
                    className="text-emerald-600 focus:ring-emerald-500" 
                  />
                  Use for this order only
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input 
                    type="radio" 
                    name="saveOption" 
                    value="update-default" 
                    checked={saveAddressOption === 'update-default'} 
                    onChange={(e) => setSaveAddressOption(e.target.value)} 
                    className="text-emerald-600 focus:ring-emerald-500" 
                  />
                  Update my default profile address
                </label>
              </div>

            </form>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6"><CreditCard className="text-emerald-500" /> Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'Cash On Delivery' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="Cash On Delivery" checked={paymentMethod === 'Cash On Delivery'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500" />
                <span className="font-semibold text-gray-800">Cash On Delivery</span>
              </label>
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'Demo Online Payment' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                <input type="radio" name="payment" value="Demo Online Payment" checked={paymentMethod === 'Demo Online Payment'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500" />
                <span className="font-semibold text-gray-800">Demo Online Payment</span>
              </label>
            </div>
          </div>
        </div>

        {/* Summary side */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Review Order</h2>
          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
            {cart?.items?.map(item => (
              <div key={item._id} className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-3">
                    <img src={item.product?.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-100" />
                    <div>
                      <div className="font-semibold text-gray-900 line-clamp-1">{item.product?.name}</div>
                      <div className="text-gray-500 text-xs">Qty: {item.quantity}</div>
                    </div>
                 </div>
                 <div className="font-bold text-gray-900">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm pt-4 border-t border-gray-100">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span className="font-semibold text-gray-900">₹{deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-emerald-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            form="checkout-form"
            className="w-full mt-8 bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            <ShieldCheck size={20} /> Place Order Securely
          </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
