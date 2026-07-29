import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import agentIcon1 from '../../../assets/images/agent-icon-1.png';
import agentIcon2 from '../../../assets/images/agent-icon-2.png';
import agentIcon3 from '../../../assets/images/agent-icon-3.png';
import agentIcon4 from '../../../assets/images/agent-icon-4.png';
import agentIcon5 from '../../../assets/images/agent-icon-5.png';
import agentIcon6 from '../../../assets/images/agent-icon-6.png';

const agents = [
  { id: 1, name: 'VetConnect AI', desc: 'Your 24/7 virtual veterinary assistant.', icon: agentIcon1, color: 'from-blue-500/20 to-blue-600/5', border: 'hover:border-blue-300', shadow: 'hover:shadow-blue-500/20', path: '/dashboard/ai' },
  { id: 2, name: 'NutriPaws AI', desc: 'Personalized diet & nutrition plans.', icon: agentIcon2, color: 'from-green-500/20 to-green-600/5', border: 'hover:border-green-300', shadow: 'hover:shadow-green-500/20' },
  { id: 3, name: 'PetHealth AI', desc: 'Proactive health tracking & insights.', icon: agentIcon3, color: 'from-teal-500/20 to-teal-600/5', border: 'hover:border-teal-300', shadow: 'hover:shadow-teal-500/20' },
  { id: 4, name: 'GroomEase AI', desc: 'Smart grooming schedules & tips.', icon: agentIcon4, color: 'from-purple-500/20 to-purple-600/5', border: 'hover:border-purple-300', shadow: 'hover:shadow-purple-500/20' },
  { id: 5, name: 'PetCommerce AI', desc: 'Curated shopping for your furry friend.', icon: agentIcon5, color: 'from-orange-500/20 to-orange-600/5', border: 'hover:border-orange-300', shadow: 'hover:shadow-orange-500/20' },
  { id: 6, name: 'TravelPaws AI', desc: 'Stress-free travel & arrangements.', icon: agentIcon6, color: 'from-indigo-500/20 to-indigo-600/5', border: 'hover:border-indigo-300', shadow: 'hover:shadow-indigo-500/20' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

const AIAgentGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-poppins font-bold text-text-heading flex items-center gap-2 mb-1">
            Your AI Team <Sparkles className="text-secondary" size={24} />
          </h2>
          <p className="text-gray-500 text-sm font-medium">Smart assistants ready to help you manage your pet's life.</p>
        </div>
        <button className="text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors bg-primary/10 px-4 py-2 rounded-xl">
          Manage Agents <ArrowRight size={16} />
        </button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {agents.map((agent) => (
          <motion.div 
            variants={item}
            key={agent.id} 
            onClick={() => {
              if (agent.path) {
                navigate(agent.path);
              }
            }}
            className={`group relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 ${agent.border} transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:shadow-xl ${agent.shadow} overflow-hidden`}
          >
            {/* Subtle Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="relative z-10 flex gap-5 items-start">
              <div className="w-20 h-20 shrink-0 rounded-2xl bg-white shadow-sm border border-gray-50 p-2 flex items-center justify-center group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500">
                <img src={agent.icon} alt={agent.name} className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              
              <div className="flex-1 flex flex-col pt-1">
                <h3 className="font-poppins font-bold text-gray-800 text-lg mb-1 group-hover:text-primary transition-colors">{agent.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium mb-3">{agent.desc}</p>
                
                <div className="mt-auto flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Online & Ready</span>
                </div>
              </div>
            </div>

            {/* Hover Action Button */}
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-primary">
                <ArrowRight size={16} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default AIAgentGrid;
