import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import styles from './FAQ.module.css';

const faqs = [
  {
    q: "How does FurryFriend's AI work?",
    a: "FurryFriend uses six specialized AI agents that collaborate to provide comprehensive pet care. When you describe a concern, our agents analyze symptoms, find vets, and adjust diet recommendations simultaneously."
  },
  {
    q: "Is my pet's data safe and private?",
    a: "Absolutely. We are HIPAA-compliant and use end-to-end encryption for all health data. Your pet's records are never sold to third parties."
  },
  {
    q: "Can FurryFriend replace a real veterinarian?",
    a: "No — FurryFriend complements veterinary care, it doesn't replace it. Our AI helps you understand symptoms and prepare for visits."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className={`section ${styles.faqSection}`}>
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.left}>
            <div className={styles.badge}>❓ FAQ</div>
            <h2 className={styles.title}>Frequently Asked Questions</h2>
            <p className={styles.subtitle}>Everything you need to know about FurryFriend.</p>
          </div>

          <div className={styles.accordion}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.item}>
                <button 
                  className={styles.question}
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`${styles.icon} ${openIndex === index ? styles.iconOpen : ''}`} />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={styles.answerWrap}>
                        <p>{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
