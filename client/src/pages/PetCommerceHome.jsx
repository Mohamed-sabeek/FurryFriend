import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, getRecommendedProducts } from '../redux/slices/productSlice';
import PetCommerceCard from '../components/PetCommerceCard';
import { Search, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PetCommerceHome = () => {
  const dispatch = useDispatch();
  const { products, recommendedProducts, recommendationReason, isLoading } = useSelector(state => state.products);
  const { currentPet } = useSelector(state => state.pets);
  const { cart } = useSelector(state => state.cart);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Dog Food', 'Cat Food', 'Treats', 'Supplements', 'Medicines', 'Grooming', 'Toys', 'Accessories'];

  useEffect(() => {
    dispatch(getProducts({ search: searchTerm, category: activeCategory !== 'All' ? activeCategory : '' }));
  }, [dispatch, searchTerm, activeCategory]);

  useEffect(() => {
    if (currentPet?._id) {
      dispatch(getRecommendedProducts(currentPet._id));
    }
  }, [dispatch, currentPet]);

  const cartItemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pet<span className="text-emerald-500">Commerce</span></h1>
          <p className="text-gray-500 mt-1">Everything your furry friend needs.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/commerce/cart" className="relative bg-emerald-50 p-3 rounded-xl text-emerald-600 hover:bg-emerald-100 transition-colors">
            <ShoppingBag size={24} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Recommended Section (AI Powered without Groq API call) */}
      {currentPet && recommendedProducts?.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recommended for {currentPet.petName}</h2>
              <p className="text-emerald-600 text-sm font-medium mt-1">Based on Health & Nutrition AI Insights</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recommendedProducts.map(product => (
              <PetCommerceCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                activeCategory === cat 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{activeCategory === 'All' ? 'All Products' : activeCategory}</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-emerald-500" size={40} />
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-gray-900">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map(product => (
              <PetCommerceCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default PetCommerceHome;
