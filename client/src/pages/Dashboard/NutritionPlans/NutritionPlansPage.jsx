import React, { useState } from 'react';
import { Apple, Droplets, Target, Flame, CheckCircle2, Circle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeader from '../../../components/ui/SectionHeader';
import StatCard from '../../../components/ui/StatCard';
import SummaryCard from '../../../components/ui/SummaryCard';
import { nutritionMockData } from './mockData';

const NutritionPlansPage = () => {
  const [selectedPet, setSelectedPet] = useState('Luna');
  const data = nutritionMockData;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader 
        title="Nutrition Plans" 
        subtitle="Personalized nutrition and feeding recommendations."
        icon={Apple}
      />

      <div className="mb-8 flex items-center justify-between">
        <div className="relative">
          <select 
            value={selectedPet}
            onChange={(e) => setSelectedPet(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-text-heading font-semibold rounded-2xl px-5 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer"
          >
            <option value="Luna">🐶 Luna</option>
            <option value="Max">🐱 Max</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Daily Calories" 
          value={`${data.dailyCalories.current} / ${data.dailyCalories.target}`} 
          icon={Flame} 
          color="orange"
        />
        <StatCard 
          title="Meals Today" 
          value={`${data.mealsToday} / ${data.mealPlan.length}`} 
          icon={Apple} 
          color="green"
        />
        <StatCard 
          title="Water Intake (ml)" 
          value={`${data.waterIntake.current} / ${data.waterIntake.target}`} 
          icon={Droplets} 
          color="blue"
        />
        <StatCard 
          title="Weight Goal (kg)" 
          value={`${data.weightGoal.current} / ${data.weightGoal.target}`} 
          icon={Target} 
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SummaryCard title="Today's Meal Plan" icon={Apple}>
            <div className="relative border-l-2 border-red-100 ml-4 space-y-8 py-4">
              {data.mealPlan.map((meal, idx) => (
                <motion.div 
                  key={meal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-8"
                >
                  <div className="absolute -left-[17px] top-2 bg-white rounded-full">
                    {meal.completed ? (
                      <CheckCircle2 className="text-green-500 bg-green-50 rounded-full" size={32} />
                    ) : (
                      <Circle className="text-gray-300 bg-gray-50 rounded-full" size={32} />
                    )}
                  </div>
                  
                  <div className="bg-white hover:bg-red-50/30 transition-all rounded-2xl p-5 border border-gray-100 shadow-sm group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1 block">
                          {meal.time}
                        </span>
                        <h3 className="text-lg font-bold text-gray-800">{meal.name}</h3>
                      </div>
                      <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-xl text-xs font-bold border border-orange-100 shadow-sm">
                        {meal.calories} kcal
                      </span>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600 space-y-2">
                      <p className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <strong className="text-gray-700">Food:</strong>
                        <span className="font-medium text-gray-800">{meal.food}</span>
                      </p>
                      <p className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <strong className="text-gray-700">Quantity:</strong>
                        <span className="font-medium text-gray-800">{meal.quantity}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </SummaryCard>
        </div>

        <div className="lg:col-span-1">
          <SummaryCard title="Nutrition Tips" icon={Lightbulb} className="sticky top-6">
            <div className="space-y-4 mt-2">
              {data.nutritionTips.map((tip, idx) => (
                <div key={idx} className="flex gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <Lightbulb size={20} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900 leading-relaxed font-medium">{tip}</p>
                </div>
              ))}
            </div>
          </SummaryCard>
        </div>
      </div>
    </div>
  );
};

export default NutritionPlansPage;
