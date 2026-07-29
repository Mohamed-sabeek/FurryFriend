import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, AlertTriangle, CheckCircle, Activity, 
  Syringe, Pill, FileText, Calendar, Stethoscope, 
  RefreshCw, ShieldCheck, HeartPulse, ArrowRight
} from 'lucide-react';
import api from '../../../../utils/axios';
import toast from 'react-hot-toast';

const AIHealthSummary = ({ pet }) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isOutdated, setIsOutdated] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async (force = false) => {
    if (!pet || !pet._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/ai/health-summary/${pet._id}${force ? '?force=true' : ''}`);
      setSummary(res.data.data);
      setIsOutdated(res.data.isOutdated || false);
      if (force) {
        toast.success('Health Report Updated Successfully');
      }
    } catch (err) {
      setError('Failed to generate health summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [pet]);

  if (!pet) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <Sparkles className="text-primary animate-pulse" size={32} />
        </div>
        <div className="text-center space-y-2">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-xl font-bold text-gray-800"
          >
            Generating Health Report...
          </motion.p>
          <p className="text-sm font-medium text-gray-500 animate-pulse">Analyzing latest medical records and consultations</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-100">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-red-800 mb-2">Unable to load report</h3>
        <p className="text-red-600/80 mb-6">{error}</p>
        <button 
          onClick={() => fetchSummary(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Intelligent Health Report</h2>
            <p className="text-xs text-gray-500 font-medium">Generated from the latest medical consultations</p>
          </div>
        </div>
        <button 
          onClick={() => fetchSummary(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm"
        >
          <RefreshCw size={16} />
          Regenerate Health Report
        </button>
      </div>

      {/* Outdated Warning */}
      {isOutdated && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3 text-orange-800">
            <AlertTriangle size={24} />
            <div>
              <p className="font-bold">A newer medical consultation is available.</p>
              <p className="text-sm text-orange-700">The current report may not reflect the latest visit.</p>
            </div>
          </div>
          <button 
            onClick={() => fetchSummary(true)}
            className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors"
          >
            Update Report Now
          </button>
        </motion.div>
      )}

      {/* Main Report Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Stats & Score */}
        <div className="space-y-6">
          {/* Health Score */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Overall Health Score</h3>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className={`text-7xl font-black tracking-tight ${
                summary.healthScore >= 80 ? 'text-green-500' :
                summary.healthScore >= 50 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {summary.healthScore}
              </span>
              <span className="text-gray-400 font-bold text-2xl">/100</span>
            </div>
            {summary.emergencyWarning && (
              <div className="mt-4 inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                <AlertTriangle size={14} /> {summary.emergencyWarning}
              </div>
            )}
          </div>

          {/* Current Status */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <Activity size={20} />
              <h3 className="font-bold">Current Status</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.currentStatus}</p>
          </div>

          {/* Recommended Follow-up */}
          {summary.recommendedFollowUp && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Recommended Follow-up</h3>
                <p className="text-sm text-gray-600">{summary.recommendedFollowUp}</p>
              </div>
            </div>
          )}
        </div>

        {/* Middle & Right Column: Detailed Analysis */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Medical & Diagnosis Summary */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-800 mb-6 border-b border-gray-100 pb-4">
              <Stethoscope className="text-primary" size={24} />
              <h3 className="font-bold text-lg">Doctor's Consultation & Analysis</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Medical Summary</h4>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.medicalSummary}</p>
                </div>
                {summary.recoveryProgress && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Recovery Progress</h4>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.recoveryProgress}</p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Diagnosis Summary</h4>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.diagnosisSummary}</p>
              </div>
            </div>
          </div>

          {/* Vitals Analysis */}
          {(summary.weightAnalysis || summary.temperatureAnalysis || summary.heartRateAnalysis) && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-800 mb-6 border-b border-gray-100 pb-4">
                <Activity className="text-blue-500" size={24} />
                <h3 className="font-bold text-lg">Vitals Analysis</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summary.weightAnalysis && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Weight</h4>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.weightAnalysis}</p>
                  </div>
                )}
                {summary.temperatureAnalysis && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Temperature</h4>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.temperatureAnalysis}</p>
                  </div>
                )}
                {summary.heartRateAnalysis && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Heart Rate</h4>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.heartRateAnalysis}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medications & Vaccinations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-purple-50/50 rounded-3xl p-6 border border-purple-100 shadow-sm">
              <div className="flex items-center gap-2 text-purple-700 mb-3">
                <Pill size={20} />
                <h3 className="font-bold">Medication Summary</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.medicationSummary}</p>
            </div>
            <div className="bg-green-50/50 rounded-3xl p-6 border border-green-100 shadow-sm">
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <Syringe size={20} />
                <h3 className="font-bold">Vaccination Status</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.vaccinationStatus}</p>
            </div>
          </div>

          {/* Health Risks & Preventive Care */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-800 mb-6 border-b border-gray-100 pb-4">
              <ShieldCheck className="text-accent" size={24} />
              <h3 className="font-bold text-lg">Risks & Preventive Care</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Health Risks</h4>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.healthRisks}</p>
              </div>
              {summary.possibleFutureRisks && (
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Possible Future Risks</h4>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.possibleFutureRisks}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Preventive Recommendations</h4>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.preventiveCareRecommendations}</p>
              </div>
            </div>
          </div>

          {/* Lifestyle, Diet, Exercise */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-800 mb-6 border-b border-gray-100 pb-4">
              <HeartPulse className="text-rose-500" size={24} />
              <h3 className="font-bold text-lg">Lifestyle & Diet Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Lifestyle</h4>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.lifestyleRecommendations}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Exercise</h4>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.exerciseRecommendations}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Diet</h4>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{summary.dietRecommendations}</p>
              </div>
            </div>
          </div>

          {/* Overall Conclusion */}
          <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-3xl border-l-4 border-primary">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Sparkles size={20} />
              <h3 className="font-bold">Overall AI Conclusion</h3>
            </div>
            <p className="text-gray-800 font-medium leading-relaxed">{summary.overallConclusion}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIHealthSummary;
