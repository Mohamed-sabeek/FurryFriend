import React from 'react';
import { cn } from '../../utils/utils';
import { Loader2, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthButton = ({ 
  children, 
  isLoading, 
  isSuccess, 
  className,
  type = 'submit',
  ...props 
}) => {
  return (
    <button
      type={type}
      disabled={isLoading || isSuccess || props.disabled}
      className={cn(
        "group relative w-full overflow-hidden flex items-center justify-center py-3 xl:py-3.5 rounded-xl text-white font-semibold text-[15px] xl:text-[1rem] transition-all duration-300",
        "bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] shadow-md hover:shadow-[0_8px_20px_rgba(255,107,107,0.3)] hover:-translate-y-1 active:translate-y-0",
        "disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md",
        isSuccess ? "from-green-500 to-green-400 shadow-green-500/20" : "",
        className
      )}
      {...props}
    >
      {/* Animated gradient hover effect via pseudo element */}
      {!isSuccess && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF8A65] to-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Loader2 className="animate-spin" size={20} />
            </motion.div>
          ) : isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Check size={20} />
              <span>Welcome Back</span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              {children}
              <ArrowRight size={18} className="transform transition-transform duration-300 group-hover:translate-x-1.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
};

export default AuthButton;
