import React, { forwardRef, useState } from 'react';
import { cn } from '../../utils/utils';

const Input = forwardRef(({ 
  label, 
  icon: Icon, 
  rightElement,
  error, 
  className,
  type = 'text',
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex flex-col w-full">
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-primary transition-colors z-10">
            <Icon size={20} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder=" "
          className={cn(
            "input-peer peer w-full px-4 pt-[22px] pb-[6px] border border-gray-200 rounded-2xl bg-gray-50/50 text-text-heading text-[13px] xl:text-[14px] leading-tight",
            "transition-all duration-300 ease-in-out",
            "focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10",
            Icon ? "pl-11 xl:pl-12" : "",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        <label className={cn(
          "input-label absolute text-sm text-gray-500 transition-all duration-200 ease-in-out pointer-events-none",
          Icon ? "left-11 xl:left-12" : "left-4",
          "top-1/2 -translate-y-1/2",
          error ? "text-red-500" : ""
        )}>
          {label}
        </label>
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-red-500 mt-1 ml-1 animate-in fade-in">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
