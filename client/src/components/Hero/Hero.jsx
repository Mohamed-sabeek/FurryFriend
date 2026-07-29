import React from 'react';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';

// We import the image from assets
import heroPets from '../../assets/images/hero-pets.png';

const Hero = () => {
  return (
    <section id="home" className={styles.hero}>
      <div className={styles.heroContainer}>
        {/* Left Side */}
        <motion.div 
          className={styles.heroLeft}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.heroBadge}>
            🐾 AI Powered Pet Care Platform
          </div>

          <h1 className={styles.heroHeading}>
            Smart Care for<br />
            Your <span className="gradient-text">Furry Friend</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Your intelligent companion for complete pet care. Book trusted veterinarians, understand symptoms, receive personalized nutrition plans, shop essentials, and more — powered by <strong>six collaborative AI agents</strong>.
          </p>

          <div className={styles.heroButtons}>
            <button className={styles.btnPrimary}>Get Started Free</button>
            <button className={styles.btnGhost}>Watch Demo</button>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div 
          className={styles.heroRight}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.heroImageWrapper}>
            <div className={styles.heroHeart}>
              <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                <path d="M150 250 C150 250 30 170 30 100 C30 60 60 30 100 30 C120 30 140 40 150 55 C160 40 180 30 200 30 C240 30 270 60 270 100 C270 170 150 250 150 250Z" fill="rgba(255,107,107,0.1)"/>
              </svg>
            </div>
            <img src={heroPets} alt="Happy pets" className={styles.heroImage} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
