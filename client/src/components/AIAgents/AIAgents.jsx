import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import styles from './AIAgents.module.css';

import icon1 from '../../assets/images/agent-icon-1.png';
import icon2 from '../../assets/images/agent-icon-2.png';
import icon3 from '../../assets/images/agent-icon-3.png';
import icon4 from '../../assets/images/agent-icon-4.png';
import icon5 from '../../assets/images/agent-icon-5.png';
import icon6 from '../../assets/images/agent-icon-6.png';

const agents = [
  {
    id: 1,
    name: 'VetConnect AI',
    iconImg: icon1,
    color: 'var(--primary)',
    gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    desc: 'Find nearby veterinarians, compare ratings, evaluate urgency, and schedule appointments intelligently.',
    tags: ['Appointment Booking', 'Nearby Vets', 'Urgency']
  },
  {
    id: 2,
    name: 'NutriPaws AI',
    iconImg: icon2,
    color: 'var(--secondary)',
    gradient: 'linear-gradient(135deg, #2EC4B6, #48E5D9)',
    desc: 'Personalized nutrition plans based on breed, age, allergies, and health conditions.',
    tags: ['Nutrition', 'Breed-Specific', 'Diet']
  },
  {
    id: 3,
    name: 'PetHealth AI',
    iconImg: icon3,
    color: '#9b5de5',
    gradient: 'linear-gradient(135deg, #9b5de5, #c77dff)',
    desc: 'Analyze symptoms, ask intelligent follow-up questions, and recommend next steps.',
    tags: ['Symptoms', 'Diagnostics', 'Emergency']
  },
  {
    id: 4,
    name: 'GroomEase AI',
    iconImg: icon4,
    color: 'var(--accent)',
    gradient: 'linear-gradient(135deg, #FFD166, #FFE299)',
    desc: 'Recommend grooming schedules and book trusted grooming centers near you.',
    tags: ['Scheduling', 'Booking', 'Ratings']
  },
  {
    id: 5,
    name: 'PetCommerce AI',
    iconImg: icon5,
    color: '#f15bb5',
    gradient: 'linear-gradient(135deg, #f15bb5, #f78bc5)',
    desc: 'Recommend products, compare prices across stores, and simplify shopping.',
    tags: ['Products', 'Price Compare', 'Deals']
  },
  {
    id: 6,
    name: 'TravelPaws AI',
    iconImg: icon6,
    color: '#00bbf9',
    gradient: 'linear-gradient(135deg, #00bbf9, #5cd1fb)',
    desc: 'Find safe boarding centers, verify vaccination records, and manage travel stays.',
    tags: ['Boarding', 'Travel', 'Records']
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100 } }
};

const AIAgents = () => {
  return (
    <section id="agents" className={`section ${styles.agentsSection}`}>
      {/* Subtle Background Elements */}
      <div className={styles.bgBlob} style={{ top: '10%', left: '-5%' }} />
      <div className={styles.bgBlob} style={{ bottom: '10%', right: '-5%', background: 'rgba(46, 196, 182, 0.05)' }} />
      <div className={styles.gridPattern} />

      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Meet Your AI Pet Care Team</h2>
          <div className={styles.divider}></div>
          <p className={styles.subtitle}>
            Six specialized AI agents working together to deliver complete intelligent pet care.
          </p>
        </div>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {agents.map((agent) => (
            <motion.div 
              key={agent.id}
              className={styles.card}
              variants={cardVariants}
              whileHover="hover"
            >
              <div className={styles.cardGlow} style={{ background: agent.gradient }}></div>
              <div className={styles.cardContent}>
                
                {/* Top of Card */}
                <div className={styles.cardHeaderTop}>
                  <div className={`${styles.iconWrap} ${styles['iconWrap' + agent.id]}`}>
                    <img 
                      src={agent.iconImg} 
                      alt={agent.name} 
                      className={styles['icon' + agent.id]} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    {agent.id === 1 && <div className={styles.heartbeatRing}></div>}
                    {agent.id === 2 && <Sparkles size={14} color="#2EC4B6" className={styles.tinySparkleBone} />}
                    {agent.id === 3 && <div className={styles.healthGlow}></div>}
                    {agent.id === 4 && <Sparkles size={14} color="#FFD166" className={styles.tinySparkleScissor} />}
                    {agent.id === 6 && <div className={styles.motionTrail}></div>}
                  </div>
                  <span className={styles.agentBadge}>AI Specialist</span>
                </div>

                {/* Header */}
                <h3 className={styles.cardTitle}>{agent.name}</h3>

                {/* Description */}
                <p className={styles.cardDesc}>{agent.desc}</p>

                {/* Capabilities Pills */}
                <div className={styles.capabilities}>
                  {agent.tags.map((tag, i) => (
                    <span 
                      key={tag} 
                      className={styles.pill} 
                      style={{ transitionDelay: `${i * 50}ms` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className={styles.cardFooter}>
                  <Sparkles size={14} className={styles.sparkleIconFooter} />
                  <span className={styles.footerText}>Powered by AI</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AIAgents;
