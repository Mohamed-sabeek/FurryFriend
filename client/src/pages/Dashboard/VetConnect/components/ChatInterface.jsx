import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ClinicCards from './ClinicCards';
import AppointmentConfirmCard from './AppointmentConfirmCard';

const LOADING_MESSAGES = [
  "🧠 Understanding your request...",
  "🐾 Reviewing pet profiles...",
  "📍 Searching nearby veterinary hospitals...",
  "🗺️ Calculating the closest options...",
  "🏥 Preparing recommendations..."
];

const LoadingIndicator = () => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end gap-3 justify-start">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-glow">
        <Bot size={20} />
      </div>
      <div className="bg-white px-5 py-4 rounded-2xl border border-gray-100 rounded-bl-sm shadow-sm flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <span className="text-[13px] font-medium text-gray-500 transition-opacity duration-300">
          {LOADING_MESSAGES[msgIdx]}
        </span>
      </div>
    </div>
  );
};

const ChatInterface = ({ messages, isLoading, onSendMessage, onRegisterPet, onBookingComplete }) => {
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    // flex-1 min-h-0: takes remaining height, never overflows the card
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/50">
      {/* Scrollable message area — flex-1 min-h-0 critical for overflow to work */}
      <div
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-4 scroll-smooth custom-scrollbar"
      >
        {messages.map((msg, idx) => {
          const isBot = msg.sender === 'bot';
          // Filter out tool/system messages from the UI if they exist in the history, 
          // but preserve custom UI types like clinics, map, or booking which might not have text
          if (!msg.text && !msg.type) return null;

          let displayText = msg.text || '';
          let options = [];
          let actionElement = null;
          
          // Check for [OPTIONS: ...] syntax
          const optionsMatch = displayText.match(/\[OPTIONS:\s*(.*?)\s*\]/i);
          if (optionsMatch) {
            options = optionsMatch[1].split('|').map(o => o.trim());
            displayText = displayText.replace(optionsMatch[0], '').trim();
          }

          // Check for [ACTION: REGISTER_PET|Species]
          const actionMatch = displayText.match(/\[ACTION:\s*REGISTER_PET\s*\|\s*([^\]]+)\s*\]/i);
          if (actionMatch) {
            const species = actionMatch[1].trim();
            displayText = displayText.replace(actionMatch[0], '').trim();
            
            actionElement = (
              <div className="mt-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mx-auto mb-3">
                  <PlusCircle size={24} />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">{species} not registered</h4>
                <p className="text-sm text-gray-500 mb-4">Register your {species} to continue booking.</p>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => onRegisterPet && onRegisterPet(species)}
                    className="px-4 py-2 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary-dark transition-colors"
                  >
                    Register {species}
                  </button>
                  <button 
                    onClick={() => onSendMessage('Cancel')}
                    className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-glow">
                  <Bot size={20} />
                </div>
              )}
              
              <div className={`flex flex-col gap-2 w-full max-w-[85%]`}>
                {msg.text && (
                  <div className={`p-4 rounded-2xl ${
                    isBot 
                      ? 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm' 
                      : 'bg-primary text-white rounded-br-sm shadow-glow'
                  }`}>
                    <div className="text-[15px] leading-relaxed prose prose-sm prose-p:my-1 prose-ul:my-1 max-w-none" dangerouslySetInnerHTML={{ __html: displayText.replace(/\n/g, '<br/>') }} />
                  </div>
                )}
                
                {msg.type === 'clinics' && msg.data && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 w-full"
                    >
                      <ClinicCards
                        clinics={msg.data.clinics}
                        conversationId={msg.data.conversationId}
                        onBookClinic={onBookingComplete}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}

                {msg.type === 'booking' && msg.data && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 w-full"
                    >
                      <AppointmentConfirmCard booking={msg.data} />
                    </motion.div>
                  </AnimatePresence>
                )}
                
                {/* Quick Replies - Only show for the very last message in the conversation to make them one-time use */}
                {options.length > 0 && isBot && idx === messages.length - 1 && !isLoading && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (!isLoading) {
                            onSendMessage(opt);
                          }
                        }}
                        className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 rounded-full text-sm font-medium transition-all duration-200"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                
                {actionElement}
              </div>

              {!isBot && (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                  <User size={20} />
                </div>
              )}
            </motion.div>
          );
        })}

        {isLoading && !messages.some(m => m.isStreaming) && <LoadingIndicator />}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0">
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask VetConnect AI anything..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-glow"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
};

export default React.memo(ChatInterface);
