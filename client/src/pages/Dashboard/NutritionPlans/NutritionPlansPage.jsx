import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Apple, Droplets, Target, Flame, CheckCircle2, Circle, Lightbulb, RefreshCw, AlertTriangle, ListChecks, Plus, X, ChevronDown, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '../../../components/ui/SectionHeader';
import StatCard from '../../../components/ui/StatCard';
import SummaryCard from '../../../components/ui/SummaryCard';
import api from '../../../utils/axios';
import toast from 'react-hot-toast';

const PreferencesModal = ({ isOpen, onClose, onGenerate }) => {
  const [preferences, setPreferences] = useState({
    dietType: 'Commercial',
    budget: 'Standard',
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onGenerate(preferences);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Custom Plan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Diet Type</label>
            <select 
              value={preferences.dietType} onChange={(e) => setPreferences({ ...preferences, dietType: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
            >
              <option>Commercial</option>
              <option>Home-cooked</option>
              <option>Mixed</option>
              <option>Vegetarian</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Budget</label>
            <select 
              value={preferences.budget} onChange={(e) => setPreferences({ ...preferences, budget: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm"
            >
              <option>Budget-friendly</option>
              <option>Standard</option>
              <option>Premium</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Special Requests</label>
            <textarea 
              value={preferences.specialRequests} onChange={(e) => setPreferences({ ...preferences, specialRequests: e.target.value })}
              className="w-full p-2 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm resize-none"
              placeholder="e.g. Needs to be easy to chew" rows="2"
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-primary text-white rounded-xl flex items-center gap-2">
              {loading && <RefreshCw size={14} className="animate-spin"/>} Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SPECIES_EMOJI = {
  Dog: '🐶', Cat: '🐱', Bird: '🐦', Rabbit: '🐰',
  Fish: '🐠', Hamster: '🐹', Turtle: '🐢', Other: '🐾'
};

const NutritionPlansPage = () => {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [waterLogged, setWaterLogged] = useState(0);
  const [isStale, setIsStale] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await api.get('/pets');
        if (res.data.success && res.data.data.length > 0) {
          setPets(res.data.data);
          setSelectedPet(res.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPets();
  }, []);

  const fetchPlan = useCallback(async (petId) => {
    if (!petId) return;
    setLoading(true);
    try {
      const res = await api.get(`/nutrition/${petId}/plan`);
      if (res.data.success) {
        setPlan(res.data.data);
        setIsStale(res.data.isStale || false);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setPlan(null);
        setIsStale(false);
      } else {
        console.error(err);
        toast.error('Failed to load nutrition plan.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWater = useCallback(async (petId) => {
    if (!petId) return;
    try {
      const res = await api.get(`/water/${petId}/today`);
      if (res.data.success) {
        setWaterLogged(res.data.data || 0);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchPlan(selectedPet);
    fetchWater(selectedPet);
  }, [selectedPet, fetchPlan, fetchWater]);

  const generatePlan = async (preferences) => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const res = await api.post(`/nutrition/${selectedPet}/generate`, { preferences });
      if (res.data.success) {
        setPlan(res.data.data);
        setIsStale(false);
        toast.success('New nutrition plan generated successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate nutrition plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleWaterLog = async () => {
    if (!selectedPet) return;
    try {
      const res = await api.post(`/water/${selectedPet}/log`, { amount: 250 });
      if (res.data.success) {
        setWaterLogged(res.data.data.amount);
        toast.success('Logged 250ml water!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to log water');
    }
  };

  if (!pets.length && !loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-gray-800">No Pets Found</h2>
        <p className="text-gray-500 mt-2">Please add a pet in My Pets to generate a nutrition plan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader 
        title="NutriPaws AI" 
        subtitle="Data-driven, personalized nutrition agent."
        icon={Apple}
      />

      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-64" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white border border-gray-200 text-gray-800 font-bold rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {(() => {
                const p = pets.find(pet => pet._id === selectedPet);
                if (p) {
                  return (
                    <>
                      <span>{SPECIES_EMOJI[p.species] || '🐾'}</span>
                      <span>{p.petName}</span>
                    </>
                  );
                }
                return 'Select Pet';
              })()}
            </div>
            <ChevronDown className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={18} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50 py-2"
              >
                {pets.map(p => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setSelectedPet(p._id);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-2.5 hover:bg-red-50 text-gray-700 hover:text-primary font-bold flex items-center gap-2 transition-colors"
                  >
                    <span>{SPECIES_EMOJI[p.species] || '🐾'}</span>
                    <span>{p.petName}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button 
          onClick={() => setIsPrefModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-bold shadow-sm hover:bg-primary-dark transition-colors"
        >
          <RefreshCw size={16} /> Generate New Plan
        </button>
      </div>

      <PreferencesModal 
        isOpen={isPrefModalOpen} 
        onClose={() => setIsPrefModalOpen(false)}
        onGenerate={generatePlan}
      />

      {isStale && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-blue-500" size={24} />
            <div>
              <p className="font-bold">Medical Data Updated</p>
              <p className="text-sm opacity-90">Your pet's medical information has changed. A newer nutrition plan can be generated.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsPrefModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Generate New Plan
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="font-bold text-gray-800 text-lg">NutriPaws is analyzing medical records...</h3>
          <p className="text-gray-500 text-sm mt-1">Checking appointments, weight trends, and allergies.</p>
        </div>
      ) : !plan ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <AlertTriangle size={48} className="text-orange-400 mb-4" />
          <h3 className="font-bold text-gray-800 text-lg">No Plan Available</h3>
          <p className="text-gray-500 text-sm mt-1 mb-4">Generate a plan to get started.</p>
          <button onClick={() => setIsPrefModalOpen(true)} className="px-6 py-2 bg-primary text-white rounded-xl font-bold">Generate Plan</button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* AI Reasoning / Overview */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-xl font-bold text-primary">{plan.planData.nutritionScore || 85}</span>
            </div>
            <div>
              <h4 className="font-bold text-primary-dark text-lg mb-1">{plan.planData.petSummary}</h4>
              <p className="text-sm text-gray-700 mb-2">{plan.planData.currentNutritionStatus}</p>
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Target size={14} /> Target Goal: {plan.planData.targetNutritionGoal}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3">
              <Activity className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-blue-800 text-sm mb-1">Doctor's Diagnosis & Medical Context</h4>
                <p className="text-sm text-blue-700">{plan.planData.doctorDiagnosisSummary}</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex gap-3">
              <Lightbulb className="text-green-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-green-800 text-sm mb-1">Nutrition Analysis</h4>
                <p className="text-sm text-green-700">{plan.planData.nutritionAnalysis}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              title="Daily Calories" 
              value={`${plan.planData.dailyCalories?.target || 0} kcal`} 
              icon={Flame} 
              color="orange"
            />
            
            {/* Water Tracker Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Droplets size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Water Intake Today</p>
                  <p className="text-sm font-bold text-gray-800">{waterLogged} / {plan.planData.waterIntake?.target || 0} ml</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 mt-2">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((waterLogged / (plan.planData.waterIntake?.target || 1)) * 100, 100)}%` }}></div>
              </div>
              <button onClick={handleWaterLog} className="w-full py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                + Log 250ml
              </button>
            </div>

            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Macronutrients</h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-purple-600">Protein</span>
                  <span className="text-sm font-medium text-gray-700">{plan.planData.macronutrients?.protein}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-orange-600">Fat</span>
                  <span className="text-sm font-medium text-gray-700">{plan.planData.macronutrients?.fat}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-green-600">Carbs</span>
                  <span className="text-sm font-medium text-gray-700">{plan.planData.macronutrients?.carbs}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-emerald-600">Fiber</span>
                  <span className="text-sm font-medium text-gray-700">{plan.planData.macronutrients?.fiber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Weekly Meal Plan */}
            <div className="lg:col-span-2 space-y-6">
              <SummaryCard title="7-Day Meal Plan" icon={Apple}>
                <div className="mt-4 space-y-4">
                  {plan.planData.weeklyMealPlan && Object.entries(plan.planData.weeklyMealPlan).map(([day, meals], idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">{day}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(meals).map(([mealType, description], mIdx) => (
                          <div key={mIdx} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                            <span className="text-xs font-bold text-primary uppercase">{mealType}</span>
                            <p className="text-sm text-gray-700 mt-1">{description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SummaryCard>
              
              <SummaryCard title="General Advice" icon={ListChecks}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                    <span className="text-xs font-bold text-gray-500 block mb-1">Meal Frequency</span>
                    <span className="text-sm font-medium text-gray-800">{plan.planData.mealFrequency}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                    <span className="text-xs font-bold text-gray-500 block mb-1">Portion Size</span>
                    <span className="text-sm font-medium text-gray-800">{plan.planData.portionSize}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl sm:col-span-2">
                    <span className="text-xs font-bold text-gray-500 block mb-1">Weight Management</span>
                    <span className="text-sm font-medium text-gray-800">{plan.planData.weightManagementAdvice}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl sm:col-span-2">
                    <span className="text-xs font-bold text-gray-500 block mb-1">Recovery Diet (if applicable)</span>
                    <span className="text-sm font-medium text-gray-800">{plan.planData.recoveryDiet}</span>
                  </div>
                </div>
              </SummaryCard>
            </div>

            {/* Sidebar (Foods, Supplements) */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Recommended Foods */}
              <SummaryCard title="Recommended Foods" icon={CheckCircle2}>
                <div className="space-y-3 mt-4">
                  {plan.planData.recommendedFoods && plan.planData.recommendedFoods.map((item, idx) => (
                    <div key={idx} className="bg-green-50 border border-green-100 p-3 rounded-xl">
                      <h4 className="font-bold text-green-800 text-sm">{item.food}</h4>
                      <p className="text-xs text-green-700 mt-1">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </SummaryCard>
              
              {/* Foods to Avoid */}
              <SummaryCard title="Foods to Avoid" icon={X}>
                <div className="space-y-3 mt-4">
                  {plan.planData.foodsToAvoid && plan.planData.foodsToAvoid.map((item, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-100 p-3 rounded-xl">
                      <h4 className="font-bold text-red-800 text-sm">{item.food}</h4>
                      <p className="text-xs text-red-700 mt-1">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </SummaryCard>

              {/* Supplements */}
              <SummaryCard title="Supplements" icon={Plus}>
                <div className="space-y-3 mt-4">
                  {plan.planData.supplements && plan.planData.supplements.map((supp, idx) => (
                    <div key={idx} className="bg-purple-50 border border-purple-100 p-3 rounded-xl">
                      <h4 className="font-bold text-purple-800 text-sm">{supp.name}</h4>
                      <p className="text-xs text-purple-600 mt-1">{supp.reason}</p>
                    </div>
                  ))}
                </div>
              </SummaryCard>
              
              {/* PetCommerce Integration */}
              <SummaryCard title="Recommended Products" icon={Target}>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Based on your pet's needs, we recommend these product categories from our shop:</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.planData.petCommerceRecommendations?.categories?.map((cat, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </SummaryCard>

            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NutritionPlansPage;
