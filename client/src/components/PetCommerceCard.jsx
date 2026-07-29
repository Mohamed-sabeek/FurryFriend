import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { ShoppingCart, Star, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PetCommerceCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then(() => toast.success('Added to cart'))
      .catch((err) => toast.error(err));
  };

  return (
    <Link to={`/commerce/product/${product._id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 h-full flex flex-col relative overflow-hidden">
        {product.isRecommended && (
          <div className="absolute top-2 left-2 z-10 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <CheckCircle size={12} /> Recommended
          </div>
        )}
        <div className="h-48 overflow-hidden rounded-t-2xl relative bg-gray-50 p-4">
          <img 
            src={product.images?.[0] || 'https://via.placeholder.com/150'} 
            alt={product.name} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="text-xs text-emerald-600 font-semibold mb-1 uppercase tracking-wider">{product.brand}</div>
          <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-3 text-sm text-yellow-500">
            <Star size={16} fill="currentColor" />
            <span className="text-gray-600 font-medium">{product.rating}</span>
          </div>
          <div className="mt-auto flex items-center justify-between">
            <div className="font-extrabold text-xl text-gray-900">₹{product.price}</div>
            <button 
              onClick={handleAddToCart}
              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white p-2.5 rounded-xl transition-colors duration-300"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PetCommerceCard;
