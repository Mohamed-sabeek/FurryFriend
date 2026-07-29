import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ image, title, category, rating, reviews, price, inStock = true }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 group flex flex-col h-full relative"
    >
      <div className="relative h-48 mb-4 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center p-4">
        {image ? (
           <img src={image} alt={title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse rounded-2xl"></div>
        )}
        
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-800 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{category}</span>
        <h3 className="font-bold text-gray-800 text-base leading-tight mb-2 line-clamp-2">{title}</h3>
        
        <div className="flex items-center gap-1.5 mb-3 mt-auto">
          <div className="flex items-center text-yellow-400">
            <Star size={14} className="fill-yellow-400" />
            <span className="text-xs font-bold text-gray-700 ml-1">{rating}</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">({reviews})</span>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-xl font-black text-gray-800">{price}</span>
          <button 
            disabled={!inStock}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
              inStock ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
