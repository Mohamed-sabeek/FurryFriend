import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import styles from './CTA.module.css';

const CTA = () => {
  return (
    <section id="contact" className={styles.ctaSection}>
      <div className="container">
        <motion.div 
          className={styles.ctaCard}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Animated Background Mesh */}
          <div className={styles.meshGlow1}></div>
          <div className={styles.meshGlow2}></div>
          <div className={styles.meshGlow3}></div>
          
          {/* Content */}
          <div className={styles.content}>
            <motion.div 
              className={styles.badge}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles size={14} className={styles.sparkleIcon} /> Start Today — It's Free
            </motion.div>
            
            <h2 className={styles.heading}>
              Ready to Give Your Pet<br />
              <span className={styles.highlight}>Smarter Care?</span>
            </h2>
            
            <p className={styles.subtitle}>
              Join thousands of pet parents who have already transformed their pet care experience with our intelligent AI network.
            </p>
            
            <div className={styles.buttons}>
              <button className={styles.btnPrimary}>
                Start For Free <ArrowRight size={18} className={styles.btnArrow} />
              </button>
              <button className={styles.btnSecondary}>
                Book a Demo
              </button>
            </div>
            
            <div className={styles.trust}>
              <div className={styles.trustItem}>
                <div className={styles.checkWrap}><Check size={12} strokeWidth={3} /></div> 
                Free forever plan
              </div>
              <div className={styles.trustItem}>
                <div className={styles.checkWrap}><Check size={12} strokeWidth={3} /></div> 
                No credit card required
              </div>
              <div className={styles.trustItem}>
                <div className={styles.checkWrap}><Check size={12} strokeWidth={3} /></div> 
                30-day money back
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
