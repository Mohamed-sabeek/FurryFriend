import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HeroHeader from './components/HeroHeader';
import ChatInterface from './components/ChatInterface';
import ChatSidebar from './components/ChatSidebar';
import { useDispatch } from 'react-redux';
import { fetchPets } from '../../../redux/slices/petSlice';
import api from '../../../utils/axios';
import toast from 'react-hot-toast';
import AddPetModal from '../../../components/pets/AddPetModal';

const WELCOME_MSG = {
  sender: 'bot',
  text: '👋 Hi there!\n\nI\'m **VetConnect AI** — your autonomous veterinary assistant.\n\nHow can I help your pet today?'
};

const VetConnectPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const sendRef = useRef(null);
  const sidebarRef = useRef(null);

  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [bookingState, setBookingState] = useState(null);
  
  // Add Pet Modal State
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [addPetSpecies, setAddPetSpecies] = useState('');

  // ─── Send message ────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (text, silent = false) => {
    // Generate a unique ID for the bot's message so we can update it while streaming
    const tempMessageId = Date.now().toString();

    if (!silent) {
      setMessages(prev => [
        ...prev, 
        { sender: 'user', text }
      ]);
    }
    setIsLoading(true);

    try {
      let convId = activeConversationId;
      if (!convId) {
        const newRes = await api.post('/ai/conversations');
        convId = newRes.data.data.id;
        setActiveConversationId(convId);
        if (sidebarRef.current?.refresh) sidebarRef.current.refresh();
      }

      const payload = { message: text, conversationId: convId, stream: true };
      if (userLocation) {
        payload.lat = userLocation.lat;
        payload.lng = userLocation.lng;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let botContent = '';
      
      // No placeholder to clear anymore, we add the message dynamically

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.type === 'token') {
                botContent += data.content;
                setMessages(prev => {
                  const msgExists = prev.some(m => m.id === tempMessageId);
                  if (msgExists) {
                    return prev.map(m => m.id === tempMessageId ? { ...m, text: botContent } : m);
                  } else {
                    return [...prev, { sender: 'bot', text: botContent, id: tempMessageId, isStreaming: true }];
                  }
                });
              } else if (data.type === 'tool_start') {
                // Could show a "Using tool: {data.tool}" message if desired
              } else if (data.type === 'done') {
                const finalResult = data.finalResult;
                
                // Finalise the text message
                setMessages(prev => {
                  const msgExists = prev.some(m => m.id === tempMessageId);
                  if (msgExists) {
                    return prev.map(m => m.id === tempMessageId ? { ...m, text: finalResult.content, isStreaming: false } : m);
                  } else {
                    return [...prev, { sender: 'bot', text: finalResult.content, id: tempMessageId, isStreaming: false }];
                  }
                });
                
                if (data.bookingState) {
                  setBookingState(data.bookingState);
                }
                
                // Handle tools fired (maps, bookings)
                if (finalResult.toolsFired?.length > 0) {
                  const newMessages = [];
                  finalResult.toolsFired.forEach(tool => {
                    try {
                      const result = JSON.parse(tool.content);
                      
                      // Handling local clinics
                      if (result.action === 'SHOW_CLINICS' && result.clinics) {
                        console.log('Frontend received SHOW_CLINICS');
                        console.log('Rendering ClinicCards component');
                        newMessages.push({
                          sender: 'bot',
                          type: 'clinics',
                          data: {
                            clinics: result.clinics,
                            conversationId: convId
                          }
                        });
                      }
                      
                      // Keep old maps logic intact but hidden in UI
                      if ((tool.name === 'searchNearbyHospitals' || tool.name === 'findEmergencyHospital') && result.hospitals) {
                        newMessages.push({
                          sender: 'bot',
                          type: 'map',
                          data: {
                            hospitals: result.hospitals,
                            userLocation: userLocation || (result.userLat ? { lat: result.userLat, lng: result.userLng } : null),
                            isEmergency: result.isEmergency || false
                          }
                        });
                      }
                      
                      if (tool.name === 'bookAppointment' && result.success) {
                        newMessages.push({
                          sender: 'bot',
                          type: 'booking',
                          data: result
                        });
                      }
                    } catch (e) { /* ignore */ }
                  });
                  
                  if (newMessages.length > 0) {
                    setMessages(prev => [...prev, ...newMessages]);
                  }
                }
              } else if (data.type === 'error') {
                setMessages(prev => {
                  const msgExists = prev.some(m => m.id === tempMessageId);
                  if (msgExists) {
                    return prev.map(m => m.id === tempMessageId ? { ...m, text: `⚠️ Error: ${data.error}`, isStreaming: false } : m);
                  } else {
                    return [...prev, { sender: 'bot', text: `⚠️ Error: ${data.error}`, id: tempMessageId, isStreaming: false }];
                  }
                });
              }
            } catch (e) {
              console.error('Error parsing SSE:', e);
            }
          }
        }
      }

      if (sidebarRef.current?.refresh) {
        setTimeout(() => sidebarRef.current?.refresh?.(), 1500);
      }
    } catch (error) {
      toast.error('Failed to get AI response');
      console.error(error);
      setMessages(prev => {
        const msgExists = prev.some(m => m.id === tempMessageId);
        if (msgExists) {
          return prev.map(m => m.id === tempMessageId ? { ...m, text: '⚠️ Connection failed. Please try again.', isStreaming: false } : m);
        } else {
          return [...prev, { sender: 'bot', text: '⚠️ Connection failed. Please try again.', id: tempMessageId, isStreaming: false }];
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, userLocation]);

  sendRef.current = handleSendMessage;

  // ─── Helper: Map backend messages to frontend format ─────────────
  const mapBackendMessagesToFrontend = (backendMsgs, convId) => {
    const mapped = [];
    backendMsgs.forEach(msg => {
      if (msg.role === 'user') {
        mapped.push({ sender: 'user', text: msg.content, id: msg._id || Date.now().toString() + Math.random() });
      } else if (msg.role === 'assistant') {
        if (msg.content) {
          mapped.push({ sender: 'bot', text: msg.content, id: msg._id || Date.now().toString() + Math.random() });
        }
      } else if (msg.role === 'tool') {
        try {
          const result = JSON.parse(msg.content);
          
          if (result.action === 'SHOW_CLINICS' && result.clinics) {
            mapped.push({
              sender: 'bot',
              type: 'clinics',
              data: { clinics: result.clinics, conversationId: convId },
              id: msg._id || Date.now().toString() + Math.random()
            });
          }
          
          if ((msg.name === 'searchNearbyHospitals' || msg.name === 'findEmergencyHospital') && result.hospitals) {
            mapped.push({
              sender: 'bot',
              type: 'map',
              data: {
                hospitals: result.hospitals,
                userLocation: userLocation || (result.userLat ? { lat: result.userLat, lng: result.userLng } : null),
                isEmergency: result.isEmergency || false
              },
              id: msg._id || Date.now().toString() + Math.random()
            });
          }
          
          if (msg.name === 'bookAppointment' && result.success) {
            mapped.push({
              sender: 'bot',
              text: `✅ Fantastic! I've booked your appointment at ${result.hospitalName}. Here are the details:`,
              type: 'booking',
              data: result,
              id: msg._id || Date.now().toString() + Math.random()
            });
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });
    return mapped;
  };

  // ─── Load a conversation ─────────────────────────────────────────────────────
  const handleSelectConversation = async (id) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/ai/conversations/${id}`);
      const { messages: msgs, bookingState: bState } = res.data.data;
      setActiveConversationId(id);
      if (bState) {
        setBookingState(bState);
      } else {
        setBookingState(null);
      }
      
      const mappedMsgs = mapBackendMessagesToFrontend(msgs, id);
      setMessages([WELCOME_MSG, ...mappedMsgs]);
    } catch (err) {
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── New Chat ────────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    setActiveConversationId(null);
    setBookingState(null);
    setMessages([WELCOME_MSG]);
  };

  // ─── Mount ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchPets());

    // Default is a new chat (activeConversationId remains null).
    // The user can explicitly select old conversations from the sidebar.

    const petRegistered = searchParams.get('petRegistered');
    if (petRegistered) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('petRegistered');
      setSearchParams(newParams, { replace: true });
      setTimeout(() => {
        sendRef.current(`I have successfully registered my ${petRegistered}. Please continue.`, true);
      }, 500);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => console.warn('Geolocation unavailable:', err.message),
        { timeout: 10000 }
      );
    }
  }, [dispatch]);

  const handleRegisterPet = (species) => {
    setAddPetSpecies(species || '');
    setIsAddPetModalOpen(true);
  };

  const handlePetSaved = async (petData) => {
    setIsAddPetModalOpen(false);
    toast.success('Pet registered successfully.');
    // Refetch pets so the new pet is available
    await dispatch(fetchPets());
    
    // Send hidden message to AI to trigger re-prompt with new pet list
    // A small timeout ensures the Redux store has updated before the backend fetches
    setTimeout(() => {
      sendRef.current(`I just registered my new pet ${petData.petName}. Please ask me which pet I want to book the appointment for.`, true);
    }, 500);
  };

  return (
    /**
     * LAYOUT: h-full fills the parent <main> which is flex-1 overflow-hidden in DashboardLayout.
     * No negative margins needed — parent already has p-0 on this route.
     */
    <div className="h-full w-full flex bg-[#FDFBF7] overflow-hidden">

      {/* ── Sidebar (fixed width, full height, no scroll) ───────────── */}
      <ChatSidebar
        ref={sidebarRef}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(p => !p)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-3 md:p-4">

        {/* Header — always visible, never scrolls */}
        <HeroHeader onBookAppointment={() => handleSendMessage('I need to book an appointment.')} />

        {/* NO fixed height, NO min-height px, NO calc() — pure flex */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          <ChatInterface
            conversationId={activeConversationId}
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onRegisterPet={handleRegisterPet}
            onBookingComplete={(booking) => {
              setMessages(prev => [...prev, {
                sender: 'bot',
                text: `✅ Fantastic! I've booked your appointment at ${booking.hospitalName}. Here are the details:`,
                type: 'booking',
                data: booking
              }]);
              setBookingState(booking);
            }}
            bookingState={bookingState}
          />

        </div>
      </div>
      
      {/* Seamless Add Pet Modal */}
      <AddPetModal 
        isOpen={isAddPetModalOpen} 
        onClose={() => setIsAddPetModalOpen(false)}
        initialSpecies={addPetSpecies}
        onSaveSuccess={handlePetSaved}
      />
    </div>
  );
};

export default VetConnectPage;
