import React, { useState } from 'react';
import { ShoppingBag, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '../../../components/ui/SectionHeader';
import ProductCard from '../../../components/ui/ProductCard';
import EmptyState from '../../../components/ui/EmptyState';
import { marketplaceMockData } from './mockData';

const MarketplacePage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const data = marketplaceMockData;

  const filteredProducts = data.products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader 
        title="Marketplace" 
        subtitle="Everything your pet needs, delivered to your door."
        icon={ShoppingBag}
        onSearch={setSearchQuery}
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-orange-400 rounded-3xl p-8 mb-8 shadow-md relative overflow-hidden flex items-center justify-between">
        <div className="relative z-10 text-white max-w-lg">
          <h2 className="text-3xl font-black mb-3 text-white">Summer Sale is Live!</h2>
          <p className="text-white/90 text-lg mb-6 font-medium">Get up to 30% off on all premium dog food and toys.</p>
          <button className="bg-white text-primary font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-lg transition-all hover:scale-105">
            Shop Now
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 transform translate-x-10"></div>
        <div className="absolute right-20 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 mr-2 shrink-0 text-gray-500 font-bold text-sm">
          <Filter size={16} /> Filters
        </div>
        {data.categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0 ${
              activeCategory === category 
                ? 'bg-primary text-white shadow-primary/30 border border-transparent' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState 
          icon={Search}
          title="No products found"
          description={`We couldn't find any products matching "${searchQuery}" in ${activeCategory}.`}
          actionButton={
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="bg-primary/10 text-primary font-bold px-6 py-2 rounded-xl hover:bg-primary hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          }
        />
      )}
    </div>
  );
};

export default MarketplacePage;
