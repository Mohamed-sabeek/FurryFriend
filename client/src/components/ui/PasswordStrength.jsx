import React from 'react';
import { cn } from '../../utils/utils';
import { Check } from 'lucide-react';

const requirements = [
  { id: 'length', text: '8 characters', regex: /.{8,}/ },
  { id: 'uppercase', text: 'Uppercase', regex: /[A-Z]/ },
  { id: 'lowercase', text: 'Lowercase', regex: /[a-z]/ },
  { id: 'number', text: 'Number', regex: /[0-9]/ },
  { id: 'special', text: 'Special character', regex: /[^A-Za-z0-9]/ },
];

const PasswordStrength = ({ password = '' }) => {
  const strengthScore = requirements.filter(req => req.regex.test(password)).length;
  
  const getStrengthData = () => {
    switch(strengthScore) {
      case 0: case 1: return { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-500', width: '20%' };
      case 2: return { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-500', width: '40%' };
      case 3: return { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-500', width: '60%' };
      case 4: return { label: 'Strong', color: 'bg-green-400', textColor: 'text-green-400', width: '80%' };
      case 5: return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-500', width: '100%' };
      default: return { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-500', width: '0%' };
    }
  };

  const strength = getStrengthData();

  if (!password) return null;

  return (
    <div className="w-full flex flex-col gap-1 mt-0.5">
      <div className="flex items-center justify-between text-[9px] xl:text-[10px]">
        <span className="text-gray-500 font-medium">Password strength</span>
        <span className={cn("font-semibold", strength.textColor)}>
          {strength.label}
        </span>
      </div>
      
      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 ease-out", strength.color)}
          style={{ width: strength.width }}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 mt-1">
        {requirements.map((req) => {
          const isMet = req.regex.test(password);
          return (
            <div key={req.id} className="flex items-center gap-1 text-[9px] xl:text-[10px] leading-tight">
              <Check size={10} strokeWidth={isMet ? 3 : 2} className={isMet ? "text-green-500" : "text-gray-300"} />
              <span className={isMet ? "text-gray-700 font-medium" : "text-gray-400"}>
                {req.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrength;
