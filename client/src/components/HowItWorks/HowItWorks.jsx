import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  User, 
  Stethoscope, 
  Bone, 
  HeartPulse, 
  Scissors, 
  ShoppingCart, 
  Plane,
  CheckCircle2,
  CalendarCheck,
  ShoppingBag,
  Heart
} from 'lucide-react';
import styles from './HowItWorks.module.css';
import profilePic from '../../assets/pic.png';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } }
};

const HowItWorks = () => {
  return (
    <section id="how-it-works" className={styles.howSection}>
      {/* Background Decor */}
      <div className={styles.bgGlowMain}></div>
      <div className={styles.gridOverlay}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={16} /> AI Workflow
          </div>
          <h2 className={styles.title}>How FurryFriend Works</h2>
          <p className={styles.subtitle}>
            Experience complete AI-powered pet care through six intelligent agents working together in one seamless network.
          </p>
        </div>

        {/* Network Workflow */}
        <motion.div 
          className={styles.networkContainer}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Continuous connection line behind steps */}
          <div className={styles.connectionLine}>
            <div className={styles.travelingParticle}></div>
          </div>

          {/* Step 1 */}
          <motion.div className={styles.stepItem} variants={itemVariants}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>01</span>
              <h3 className={styles.stepTitle}>Digital Profile</h3>
            </div>
            <div className={styles.visualContainer}>
              <div className={styles.profileRing}>
                <div className={styles.profileCore}>
                  <img src={profilePic} alt="Digital Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
                </div>
              </div>
            </div>
            <p className={styles.stepDesc}>Create a complete health profile instantly.</p>
          </motion.div>

          {/* Step 2 */}
          <motion.div className={styles.stepItem} variants={itemVariants}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>02</span>
              <h3 className={styles.stepTitle}>Ask AI</h3>
            </div>
            <div className={styles.visualContainer}>
              <div className={styles.chatVisual}>
                <div className={`${styles.chatBubble} ${styles.chatUser}`}>
                  "My dog hasn't eaten today."
                </div>
                <div className={`${styles.chatBubble} ${styles.chatAI}`}>
                  "Let me check his health profile..."
                </div>
              </div>
            </div>
            <p className={styles.stepDesc}>Chat naturally about any pet concern.</p>
          </motion.div>

          {/* Step 3 (HERO) */}
          <motion.div className={`${styles.stepItem} ${styles.stepHero}`} variants={itemVariants}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumHero}>03</span>
              <h3 className={styles.stepTitleHero}>AI Collaboration</h3>
            </div>
            <div className={styles.visualContainerHero}>
              <div className={styles.hubWrapper}>
                <div className={styles.hubOrbit}></div>
                <div className={styles.hubCenter}>
                  <Sparkles size={24} color="var(--primary)" />
                </div>
                <div className={`${styles.node} ${styles.node1}`}><Stethoscope size={18} color="white" /></div>
                <div className={`${styles.node} ${styles.node2}`}><Bone size={18} color="white" /></div>
                <div className={`${styles.node} ${styles.node3}`}><HeartPulse size={18} color="white" /></div>
                <div className={`${styles.node} ${styles.node4}`}><Scissors size={18} color="white" /></div>
                <div className={`${styles.node} ${styles.node5}`}><ShoppingCart size={18} color="white" /></div>
                <div className={`${styles.node} ${styles.node6}`}><Plane size={18} color="white" /></div>
              </div>
            </div>
            <p className={styles.stepDescHero}>Six specialist agents coordinate instantly.</p>
          </motion.div>

          {/* Step 4 */}
          <motion.div className={styles.stepItem} variants={itemVariants}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>04</span>
              <h3 className={styles.stepTitle}>Receive Care</h3>
            </div>
            <div className={styles.visualContainer}>
              <div className={styles.dashboardStack}>
                <div className={styles.dashCard} style={{ zIndex: 3, transform: 'translateY(0) scale(1)' }}>
                  <CalendarCheck size={16} color="var(--primary)" /> Appointment Set
                </div>
                <div className={styles.dashCard} style={{ zIndex: 2, transform: 'translateY(-15px) scale(0.95)', opacity: 0.8 }}>
                  <CheckCircle2 size={16} color="var(--secondary)" /> Diet Plan Ready
                </div>
                <div className={styles.dashCard} style={{ zIndex: 1, transform: 'translateY(-30px) scale(0.9)', opacity: 0.6 }}>
                  <ShoppingBag size={16} color="var(--accent)" /> Food Ordered
                </div>
              </div>
            </div>
            <p className={styles.stepDesc}>Everything taken care of automatically.</p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
