import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Activity, 
  CalendarClock, 
  FileText, 
  Apple, 
  ShoppingBag, 
  BellRing 
} from 'lucide-react';
import styles from './Features.module.css';

import featuresImg from '../../assets/images/features-illustration.png';

const features = [
  { 
    title: 'AI Symptom Checker', 
    desc: 'Instant, intelligent symptom analysis', 
    icon: Activity, 
    color: 'var(--primary)',
    gradient: 'linear-gradient(135deg, rgba(255,107,107,0.1), rgba(255,107,107,0.2))' 
  },
  { 
    title: 'Smart Booking', 
    desc: 'Real-time vet availability & booking', 
    icon: CalendarClock, 
    color: 'var(--secondary)',
    gradient: 'linear-gradient(135deg, rgba(46,196,182,0.1), rgba(46,196,182,0.2))'
  },
  { 
    title: 'Medical Records', 
    desc: 'Complete digital health history', 
    icon: FileText, 
    color: 'var(--accent)',
    gradient: 'linear-gradient(135deg, rgba(255,209,102,0.2), rgba(255,209,102,0.3))'
  },
  { 
    title: 'Diet Plans', 
    desc: 'Breed-specific custom nutrition', 
    icon: Apple, 
    color: '#9b5de5',
    gradient: 'linear-gradient(135deg, rgba(155,93,229,0.1), rgba(155,93,229,0.2))'
  },
  { 
    title: 'Pet Shopping', 
    desc: 'AI-curated product recommendations', 
    icon: ShoppingBag, 
    color: '#f15bb5',
    gradient: 'linear-gradient(135deg, rgba(241,91,181,0.1), rgba(241,91,181,0.2))'
  },
  { 
    title: 'Reminders', 
    desc: 'Never miss a vaccine or checkup', 
    icon: BellRing, 
    color: '#00bbf9',
    gradient: 'linear-gradient(135deg, rgba(0,187,249,0.1), rgba(0,187,249,0.2))'
  }
];

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const Features = () => {
  return (
    <section id="features" className={`section ${styles.featuresSection}`}>
      <div className={styles.bgDecor}></div>
      <div className="container">
        <div className={styles.layout}>
          
          {/* LEFT: Phone App Showcase */}
          <motion.div 
            className={styles.left}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className={styles.imgWrap}>
              <div className={styles.imgGlow}></div>
              <motion.img 
                src={featuresImg} 
                alt="FurryFriend App Features" 
                className={styles.img} 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Decorative floating elements around the phone */}
              <motion.div className={`${styles.floatElement} ${styles.float1}`} animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                <Sparkles size={16} color="var(--primary)" />
              </motion.div>
              <motion.div className={`${styles.floatElement} ${styles.float2}`} animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
                <Activity size={18} color="var(--secondary)" />
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT: Feature Grid */}
          <motion.div 
            className={styles.right}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <div className={styles.badge}>
              <Sparkles size={14} /> Everything You Need
            </div>
            <h2 className={styles.title}>All-In-One Pet Care<br/>Powered by AI</h2>
            <p className={styles.subtitle}>
              Every feature your pet needs, all in one beautifully designed platform. No more switching between multiple apps.
            </p>

            <motion.div 
              className={styles.list}
              variants={listVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {features.map((feat, index) => (
                <motion.div key={index} className={styles.item} variants={itemVariants}>
                  <div className={styles.iconWrap} style={{ background: feat.gradient }}>
                    <feat.icon size={22} color={feat.color} className={styles.featIcon} />
                  </div>
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>{feat.title}</div>
                    <div className={styles.itemDesc}>{feat.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Features;
