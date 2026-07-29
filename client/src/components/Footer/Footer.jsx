import React from 'react';
import { Send } from 'lucide-react';
import styles from './Footer.module.css';
import logo from '../../assets/furryfriend.png';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <img src={logo} alt="FurryFriend Logo" className={styles.logoImage} />
              <span>FurryFriend</span>
            </div>
            <p className={styles.desc}>AI-powered pet care platform trusted by thousands of pet parents. Six specialized AI agents working together.</p>
            <div className={styles.social}>
              <a href="#" className={styles.socialLink}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" className={styles.socialLink}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className={styles.socialLink}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" className={styles.socialLink}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className={styles.heading}>Quick Links</h4>
            <ul className={styles.links}>
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#agents">AI Agents</a></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.heading}>Resources</h4>
            <ul className={styles.links}>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          <div className={styles.newsletter}>
            <h4 className={styles.heading}>Stay Updated</h4>
            <p className={styles.newsletterText}>Get the latest pet care tips.</p>
            <div className={styles.form}>
              <input type="email" placeholder="Enter your email" className={styles.input} />
              <button className={styles.submit}><Send size={18} /></button>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>© 2024 FurryFriend. Made with ❤️ for pet parents.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
