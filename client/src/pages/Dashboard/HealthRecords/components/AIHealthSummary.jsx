import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, CheckCircle, Info, Activity, Syringe, Pill, FileText, Calendar, Stethoscope } from 'lucide-react';
import api from '../../../../utils/axios';

const AIHealthSummary = ({ petId, refreshTrigger }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!petId) return;

    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/ai/health-summary/${petId}`);
        setSummary(res.data.data);
      } catch (err) {
        setError('Failed to generate health summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [petId, refreshTrigger]);

  if (!petId) return null;

  return (
    <div className="bg-gradient-to-b from-red-50 to-white rounded-3xl p-6 shadow-sm border border-red-100">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-primary" size={24} />
        <h2 className="text-xl font-poppins font-bold text-text-heading">AI Health Summary</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <Sparkles className="text-primary animate-pulse" size={24} />
          </div>
          <div className="text-center space-y-1">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-lg font-bold text-gray-800"
            >
              🧠 Analyzing health records...
            </motion.p>
            <p className="text-sm font-medium text-gray-500 animate-pulse">Calculating health score & reviewing data</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-red-50 rounded-2xl border border-red-100">
          <AlertTriangle className="mx-auto text-red-500 mb-2" size={32} />
          <h3 className="font-bold text-red-800 mb-1">Unable to load summary</h3>
          <p className="text-sm text-red-600/80 px-4">{error}</p>
        </div>
      ) : summary ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Health Score */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-red-50/30 rounded-2xl p-8 shadow-sm border border-red-100/50 text-center group hover:shadow-md transition-all duration-300">
            {/* Background decoration */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            
            <h3 className="relative z-10 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Overall Health Score</h3>
            <div className="relative z-10 flex items-baseline justify-center gap-1">
              <span className={`text-6xl font-black tracking-tight drop-shadow-sm ${
                summary.healthScore >= 80 ? 'text-transparent bg-clip-text bg-gradient-to-br from-green-500 to-green-600' :
                summary.healthScore >= 50 ? 'text-transparent bg-clip-text bg-gradient-to-br from-yellow-500 to-orange-500' : 
                'text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                {summary.healthScore}
              </span>
              <span className="text-gray-400/80 font-bold text-2xl">/100</span>
            </div>
          </div>

          {/* Current Status */}
          {summary.currentStatus && (
            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
              <div className="mt-1 bg-blue-50 border border-blue-100/50 p-2 rounded-xl text-blue-600 shrink-0 h-fit group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                <Stethoscope size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">Current Status</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{summary.currentStatus}</p>
              </div>
            </div>
          )}

          {/* Vaccination Status */}
          {summary.vaccinationStatus && (
            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all group">
              <div className="mt-1 bg-green-50 border border-green-100/50 p-2 rounded-xl text-green-600 shrink-0 h-fit group-hover:scale-110 group-hover:bg-green-100 transition-all duration-300">
                <Syringe size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">Vaccination Status</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{summary.vaccinationStatus}</p>
              </div>
            </div>
          )}

          {/* Medication Status */}
          {summary.medicationStatus && (
            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all group">
              <div className="mt-1 bg-purple-50 border border-purple-100/50 p-2 rounded-xl text-purple-600 shrink-0 h-fit group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300">
                <Pill size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">Medications</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{summary.medicationStatus}</p>
              </div>
            </div>
          )}

          {/* Health History */}
          {summary.healthHistory && (
            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all group">
              <div className="mt-1 bg-orange-50 border border-orange-100/50 p-2 rounded-xl text-orange-600 shrink-0 h-fit group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">Health History</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{summary.healthHistory}</p>
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          {summary.upcomingEvents && (
            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all group">
              <div className="mt-1 bg-teal-50 border border-teal-100/50 p-2 rounded-xl text-teal-600 shrink-0 h-fit group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-300">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">Upcoming Events</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{summary.upcomingEvents}</p>
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {summary.aiSuggestions && summary.aiSuggestions.length > 0 && (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 shadow-inner">
              <h3 className="flex items-center gap-2 text-sm font-bold text-primary mb-4 uppercase tracking-widest">
                <Sparkles size={18} className="animate-pulse" /> AI Suggestions
              </h3>
              <ul className="space-y-3">
                {summary.aiSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-800 font-medium">
                    <span className="text-primary mt-1 shadow-sm bg-white rounded-full p-0.5"><CheckCircle size={14} /></span>
                    <span className="leading-relaxed">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ) : null}
    </div>
  );
};

export default AIHealthSummary;
