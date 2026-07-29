import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { ShoppingCart, Heart, ShieldCheck, ArrowLeft, Star, Loader2, Info, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, isLoading } = useSelector(state => state.products);
  
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(getProductDetails(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product._id, quantity }))
      .unwrap()
      .then(() => toast.success('Added to cart'))
      .catch((err) => toast.error(err));
  };

  const handleBuyNow = () => {
    dispatch(addToCart({ productId: product._id, quantity }))
      .unwrap()
      .then(() => navigate('/commerce/cart'))
      .catch((err) => toast.error(err));
  };

  if (isLoading || !product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-6"
      >
        <ArrowLeft size={20} /> Back to Products
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Images */}
        <div className="flex flex-col gap-4">
          <div className="bg-gray-50 rounded-2xl p-8 relative">
            {product.isRecommended && (
               <div className="absolute top-4 left-4 z-10 bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                 <CheckCircle size={16} /> Recommended
               </div>
            )}
            <img 
              src={product.images?.[0] || 'https://via.placeholder.com/400'} 
              alt={product.name} 
              className="w-full h-[400px] object-contain"
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm text-emerald-600 font-bold uppercase tracking-wider mb-2">{product.brand}</h2>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-2 mt-3 text-yellow-500">
              <Star size={20} fill="currentColor" />
              <span className="text-gray-700 font-medium">{product.rating} Rating</span>
              <span className="text-gray-300">|</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-sm font-medium">In Stock: {product.stock}</span>
            </div>
          </div>

          <div className="text-4xl font-extrabold text-gray-900 border-y border-gray-100 py-6">
            ₹{product.price}
          </div>

          <div className="space-y-4 text-gray-600">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Info size={18} /> About this item</h3>
            <p className="leading-relaxed">{product.description}</p>
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-4 py-4">
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-xs text-gray-500 uppercase font-semibold">Pet Type</div>
                <div className="font-bold text-gray-900">{product.petType}</div>
             </div>
             <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-xs text-gray-500 uppercase font-semibold">Life Stage</div>
                <div className="font-bold text-gray-900">{product.lifeStage}</div>
             </div>
          </div>

          {/* Add to cart */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-white rounded-lg text-gray-600 font-bold">-</button>
              <span className="px-4 font-bold text-gray-900">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2 hover:bg-white rounded-lg text-gray-600 font-bold">+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 font-bold py-3.5 px-6 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            
            <button 
              onClick={handleBuyNow}
              className="flex-1 bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors"
            >
              Buy Now
            </button>
          </div>

          {/* Extra Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 pt-6">
            <div className="flex items-center gap-1.5"><ShieldCheck size={18} className="text-emerald-500" /> Secure Checkout</div>
            <div className="flex items-center gap-1.5"><Heart size={18} className="text-emerald-500" /> Vet Approved Quality</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
