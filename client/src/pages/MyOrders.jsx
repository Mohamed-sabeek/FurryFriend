import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserOrders } from '../redux/slices/orderSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const MyOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, isLoading } = useSelector(state => state.orders);

  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle size={16} className="text-blue-500" />;
      case 'Processing': return <Clock size={16} className="text-yellow-500" />;
      case 'Packed': return <Package size={16} className="text-orange-500" />;
      case 'Shipped': return <Truck size={16} className="text-indigo-500" />;
      case 'Delivered': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'Cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Processing': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'Packed': return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading orders...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>
      
      {orders?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link to="/commerce" className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Order Placed</div>
                    <div className="font-bold text-gray-900">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Total Amount</div>
                    <div className="font-bold text-gray-900">₹{order.totalAmount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Order ID</div>
                    <div className="font-bold text-gray-900 text-sm">#{order._id.slice(-8).toUpperCase()}</div>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => navigate(`/commerce/track/${order._id}`)}
                    className="w-full sm:w-auto bg-white border border-emerald-500 text-emerald-600 font-bold px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    Track Order
                  </button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item._id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg p-1 shrink-0 border border-gray-100">
                        <img src={item.product?.images?.[0]} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <Link to={`/commerce/product/${item.product?._id}`} className="font-bold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1">
                          {item.product?.name}
                        </Link>
                        <div className="text-sm text-gray-500 mt-0.5">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-bold text-gray-900">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
