import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, CheckCircle, Info, Activity } from 'lucide-react';
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
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-red-100/50 rounded-2xl"></div>
          <div className="h-10 bg-red-100/50 rounded-xl"></div>
          <div className="h-10 bg-red-100/50 rounded-xl"></div>
          <div className="h-10 bg-red-100/50 rounded-xl"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto text-yellow-500 mb-2" size={32} />
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      ) : summary ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Health Score */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-50 text-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Overall Health Score</h3>
            <div className="flex items-center justify-center gap-2">
              <span className={`text-5xl font-black ${
                summary.healthScore >= 80 ? 'text-green-500' :
                summary.healthScore >= 50 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {summary.healthScore}
              </span>
              <span className="text-gray-400 font-bold text-xl">/100</span>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-3">
            {summary.insights && summary.insights.map((insight, idx) => (
              <div key={idx} className={`flex items-start gap-3 p-4 rounded-2xl border ${
                insight.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' :
                'bg-blue-50 border-blue-100 text-blue-800'
              }`}>
                <div className="mt-0.5 shrink-0">
                  {insight.type === 'success' && <CheckCircle size={18} />}
                  {insight.type === 'warning' && <AlertTriangle size={18} />}
                  {insight.type === 'info' && <Info size={18} />}
                </div>
                <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>

          {/* Next Steps */}
          {summary.suggestedNextStep && (
            <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20">
              <h3 className="flex items-center gap-2 text-sm font-bold text-primary mb-2 uppercase tracking-wider">
                <Activity size={16} /> Suggested Next Step
              </h3>
              <p className="text-sm text-gray-700 font-medium">{summary.suggestedNextStep}</p>
            </div>
          )}
        </motion.div>
      ) : null}
    </div>
  );
};

export default AIHealthSummary;
