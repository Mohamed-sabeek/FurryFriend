import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { ShoppingCart, Star, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PetCommerceCard = ({ product }) => {
  const dispatch = useDispatch();
  const [imgError, setImgError] = React.useState(false);
  const [imgLoading, setImgLoading] = React.useState(true);

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then(() => toast.success('Added to cart'))
      .catch((err) => toast.error(err));
  };

  const getPlaceholderImage = (category) => {
    const base = "https://placehold.co/800x800";
    const text = category ? category.replace(/\s+/g, '+') : 'Product';
    
    switch (category) {
      case 'Dog Food':
      case 'Cat Food':
      case 'Puppy Food':
      case 'Kitten Food':
        return `${base}/fef3c7/b45309?text=${text}`; // amber for food
      case 'Medicines':
      case 'Supplements':
        return `${base}/dbeafe/1d4ed8?text=${text}`; // blue for medicine
      case 'Toys':
        return `${base}/fce7f3/be185d?text=${text}`; // pink for toys
      case 'Grooming':
        return `${base}/d1fae5/047857?text=${text}`; // green for grooming
      case 'Treats':
        return `${base}/ffedd5/c2410c?text=${text}`; // orange for treats
      default:
        return `${base}/f8fafc/94a3b8?text=${text}`; // gray for accessories/others
    }
  };

  const placeholderImage = getPlaceholderImage(product.category);

  return (
    <Link to={`/commerce/product/${product._id}`} className="block group h-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 h-full flex flex-col relative overflow-hidden">
        {product.isRecommended && (
          <div className="absolute top-2 left-2 z-20 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <CheckCircle size={10} /> Recommended
          </div>
        )}
        
        {/* Fixed Image Container (220px) */}
        <div className="h-[220px] w-full overflow-hidden rounded-t-2xl relative bg-white p-4 flex items-center justify-center border-b border-gray-50 shrink-0">
          {imgLoading && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center z-0">
               <ShoppingCart size={32} className="text-gray-300" />
            </div>
          )}
          <img 
            src={imgError ? placeholderImage : (product.images?.[0] || placeholderImage)} 
            alt={product.name} 
            className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 z-10 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImgLoading(false)}
            onError={() => {
              setImgError(true);
              setImgLoading(false);
            }}
          />
        </div>

        {/* Fixed Text Container */}
        <div className="p-4 flex flex-col flex-1">
          {/* Brand */}
          <div className="text-[10px] text-emerald-600 font-extrabold mb-1 uppercase tracking-wider line-clamp-1 h-[14px]">
            {product.brand || 'Generic'}
          </div>
          
          {/* Title - Fixed to 2 lines (min-height to prevent jumping) */}
          <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2 h-[40px] sm:h-[48px] mb-2 group-hover:text-emerald-600 transition-colors leading-tight">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-3 text-xs text-yellow-500 h-[16px]">
            <Star size={14} fill="currentColor" />
            <span className="text-gray-600 font-semibold">{product.rating || '4.0'}</span>
          </div>
          
          {/* Price & Add to Cart */}
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="font-extrabold text-lg sm:text-xl text-gray-900">₹{product.price}</div>
            <button 
              onClick={handleAddToCart}
              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white p-2 sm:p-2.5 rounded-xl transition-colors duration-300"
            >
              <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PetCommerceCard;
