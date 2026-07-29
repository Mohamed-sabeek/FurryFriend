import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Navbar.module.css';
import logo from '../../assets/furryfriend.png';

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'agents', label: 'AI Agents' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' }
];

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const isProgrammaticScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrolling.current) return;
        
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px', // Trigger when section is roughly in the middle
        threshold: 0
      }
    );

    navItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      isProgrammaticScrolling.current = true;
      setActiveSection(id);
      
      const offset = 100; // Account for fixed navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      const handleScroll = () => {
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current);
        }
        scrollTimeout.current = setTimeout(() => {
          isProgrammaticScrolling.current = false;
          window.removeEventListener('scroll', handleScroll);
        }, 100);
      };

      window.addEventListener('scroll', handleScroll);
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.navContainer}>
        <a href="#home" onClick={(e) => handleClick(e, 'home')} className={styles.navLogo}>
          <img src={logo} alt="FurryFriend Logo" className={styles.logoImage} />
        </a>

        <nav className={styles.navLinks}>
          {navItems.map(({ id, label }) => (
            <a 
              key={id}
              href={`#${id}`} 
              onClick={(e) => handleClick(e, id)}
              className={`${styles.navLink} ${activeSection === id ? styles.active : ''}`}
            >
              {activeSection === id && (
                <motion.div
                  layoutId="activePill"
                  className={styles.activePill}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 2 }}>{label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.navActions}>
          <Link to="/login" className={styles.btnGhost}>Login</Link>
          <Link to="/register" className={styles.btnPrimary}>Get Started</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
