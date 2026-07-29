import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderById } from '../redux/slices/orderSlice';
import { Check, Package, Truck, Home, CreditCard, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentOrder, isLoading } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(getOrderById(id));
  }, [dispatch, id]);

  if (isLoading || !currentOrder) {
    return <div className="p-8 text-center">Loading tracking info...</div>;
  }

  const steps = [
    { label: 'Confirmed', icon: <Check size={20} /> },
    { label: 'Processing', icon: <Package size={20} /> },
    { label: 'Packed', icon: <Package size={20} /> },
    { label: 'Shipped', icon: <Truck size={20} /> },
    { label: 'Delivered', icon: <Home size={20} /> }
  ];

  const statusIndex = steps.findIndex(s => s.label === currentOrder.status);
  const isCancelled = currentOrder.status === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-6"
      >
        <ArrowLeft size={20} /> Back to Orders
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-8 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Order Tracking</h1>
            <p className="text-gray-500 mt-1">Order ID: #{currentOrder._id.toUpperCase()}</p>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <div className="text-sm text-gray-500">Expected Delivery</div>
            <div className="font-bold text-emerald-600 text-lg">
              {format(new Date(new Date(currentOrder.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {!isCancelled ? (
          <div className="relative mb-16 px-4">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 mx-8 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 mx-8 z-0 transition-all duration-1000"
              style={{ width: `${Math.max(0, (statusIndex / (steps.length - 1)) * 100)}%` }}
            ></div>
            
            <div className="relative z-10 flex justify-between">
              {steps.map((step, index) => {
                const isCompleted = index <= statusIndex;
                const isCurrent = index === statusIndex;
                return (
                  <div key={step.label} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-500 ${
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                      {step.icon}
                    </div>
                    <div className={`mt-3 text-xs sm:text-sm font-bold ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center font-bold text-lg mb-10">
            This order has been cancelled.
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Truck size={18} className="text-emerald-500" /> Shipping Details</h3>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="font-bold text-gray-900">{currentOrder.shippingAddress.name}</div>
              <div className="text-gray-600 mt-1">{currentOrder.shippingAddress.phone}</div>
              <div className="text-gray-600 mt-2 line-clamp-2">{currentOrder.shippingAddress.address}</div>
              <div className="text-gray-600">{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.pincode}</div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-emerald-500" /> Payment Summary</h3>
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Method</span>
                <span className="font-bold text-gray-900">{currentOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-gray-900">₹{currentOrder.totalAmount}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-gray-600">Payment Status</span>
                <span className={`font-bold ${currentOrder.paymentMethod === 'Demo Online Payment' ? 'text-emerald-600' : 'text-orange-500'}`}>
                  {currentOrder.paymentMethod === 'Demo Online Payment' ? 'Paid' : 'Pending (COD)'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTracking;
