import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCart, updateCartItem, removeCartItem } from '../redux/slices/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, isLoading } = useSelector(state => state.cart);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ itemId, quantity }));
  };

  const handleRemove = (itemId) => {
    dispatch(removeCartItem(itemId));
  };

  if (!cart?.items?.length) {
    return (
      <div className="max-w-4xl mx-auto p-8 mt-10 bg-white rounded-3xl shadow-sm border border-gray-100 text-center animate-in fade-in duration-500">
        <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any products to your cart yet.</p>
        <Link to="/commerce" className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-700 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  const deliveryCharge = 50; // Mock fixed delivery charge
  const subtotal = cart.subtotal || 0;
  const total = subtotal + deliveryCharge;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6 relative">
              <div className="w-24 h-24 bg-gray-50 rounded-xl p-2 shrink-0">
                <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <Link to={`/commerce/product/${item.product?._id}`} className="font-bold text-gray-900 hover:text-emerald-600 transition-colors text-lg line-clamp-1">
                  {item.product?.name}
                </Link>
                <div className="text-emerald-600 font-semibold text-sm mb-3">{item.product?.brand}</div>
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-xl text-gray-900">₹{item.price}</div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                      <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} className="w-8 h-8 flex justify-center items-center hover:bg-white rounded text-gray-600 font-bold">-</button>
                      <span className="w-8 flex justify-center items-center font-bold text-gray-900 text-sm">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} className="w-8 h-8 flex justify-center items-center hover:bg-white rounded text-gray-600 font-bold">+</button>
                    </div>
                    <button onClick={() => handleRemove(item._id)} className="text-red-400 hover:text-red-600 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({cart.items.length} items)</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span className="font-semibold text-gray-900">₹{deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-emerald-600">₹{total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/commerce/checkout')}
            className="w-full mt-8 bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            Proceed to Checkout <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
