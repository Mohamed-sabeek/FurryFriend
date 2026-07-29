import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Quote } from 'lucide-react';
import styles from './Testimonials.module.css';

import avatarJames from '../../assets/images/avatar_james.png';
import avatarSarah from '../../assets/images/avatar_sarah.png';
import avatarMichael from '../../assets/images/avatar_michael.png';

const testimonials = [
  {
    text: "FurryFriend completely changed how I care for my golden retriever. The AI spotted that his lethargy could be diet-related and booked a vet instantly.",
    name: "James Patterson",
    role: "Golden Retriever Parent",
    avatar: avatarJames
  },
  {
    text: "As a first-time cat mom, I was overwhelmed. The PetHealth AI was like having a vet friend available 24/7. It guided me through everything.",
    name: "Sarah Chen",
    role: "Cat Mom",
    avatar: avatarSarah
  },
  {
    text: "I travel a lot for work, and the TravelPaws AI ensures my pup always has the best boarding reserved. It's an absolute lifesaver.",
    name: "Michael Torres",
    role: "French Bulldog Dad",
    avatar: avatarMichael
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } }
};

const Testimonials = () => {
  return (
    <section id="testimonials" className={`section ${styles.testimonialsSection}`}>
      <div className={styles.bgDecor}></div>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={14} /> What Pet Parents Say
          </div>
          <h2 className={styles.title}>Real Stories. Real Care.</h2>
          <p className={styles.subtitle}>
            Join thousands of pet parents who have transformed their pet care experience with our intelligent AI network.
          </p>
        </div>

        <motion.div 
          className={styles.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((test, index) => (
            <motion.div key={index} className={styles.card} variants={cardVariants}>
              
              {/* Massive background quote watermark */}
              <div className={styles.quoteMark}>
                <Quote size={120} />
              </div>

              {/* Stars */}
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" color="transparent" className={styles.starIcon} style={{ animationDelay: `${i * 100}ms` }} />
                ))}
              </div>

              {/* Quote Text */}
              <p className={styles.text}>"{test.text}"</p>

              {/* Author Info */}
              <div className={styles.author}>
                <div className={styles.avatarWrap}>
                  <div className={styles.avatarGlow}></div>
                  <img 
                    src={test.avatar} 
                    alt={test.name} 
                    style={{ 
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%'
                    }} 
                  />
                  <div className={styles.activeDot}></div>
                </div>
                <div>
                  <div className={styles.name}>{test.name}</div>
                  <div className={styles.role}>{test.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
