const vetAgent = require('./AI/vetAgent');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const { getConversation } = require('./AI/conversationManager');

// Simple in-memory cache with TTL (5 minutes)
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

const getFromCache = (key) => {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL_MS) {
    return item.data;
  }
  cache.delete(key);
  return null;
};

const setInCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const handleChatRequest = async (req, res) => {
  const startTime = Date.now();
  const timings = {};

  const recordTime = (step) => {
    timings[step] = Date.now() - startTime;
  };

  try {
    const { message, lat, lng, conversationId, stream } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message is required' });

    const userId = req.user.id;
    recordTime('RequestReceived');

    // Setup SSE if streaming is requested
    let isStreaming = stream === true;
    if (isStreaming) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
    }

    // 1. Parallelize DB Fetches with Caching
    const fetchUser = async () => {
      const cacheKey = `user_${userId}`;
      let user = getFromCache(cacheKey);
      if (!user) {
        user = await User.findById(userId).lean().select('name email');
        if (user) setInCache(cacheKey, user);
      }
      return user;
    };

    const fetchPets = async () => {
      const cacheKey = `pets_${userId}`;
      let pets = getFromCache(cacheKey);
      if (!pets) {
        pets = await Pet.find({ owner: userId }).lean();
        setInCache(cacheKey, pets);
      }
      return pets;
    };

    const fetchAppointments = async () => {
      // Don't aggressively cache appointments as they might change
      return await Appointment.find({ user: userId })
        .populate('pet', 'petName species breed age vaccinationStatus')
        .sort({ date: -1 })
        .limit(5)
        .lean();
    };
    
    const fetchConversation = async () => {
      return await getConversation(userId, 'vet', conversationId);
    };

    const fetchBookingSession = async (convId) => {
      if (!convId) return null;
      return await mongoose.model('BookingSession').findOne({ conversationId: convId }).lean();
    };

    const fetchStartTime = Date.now();
    const conversation = await fetchConversation();
    const convIdToUse = conversationId || conversation?._id;

    const [user, pets, appointments, bookingSession] = await Promise.all([
      fetchUser(),
      fetchPets(),
      fetchAppointments(),
      fetchBookingSession(convIdToUse)
    ]);
    timings['DB_Fetch'] = Date.now() - fetchStartTime;

    if (!user) {
      if (isStreaming) res.write(`data: ${JSON.stringify({ error: 'User not found' })}\n\n`);
      else res.status(404).json({ success: false, error: 'User not found' });
      if (isStreaming) res.end();
      return;
    }

    // Prepare context for the agent
    const context = {
      user: { name: user.name, email: user.email },
      pets,
      appointments,
      conversation,
      bookingSession,
      location: { lat, lng }
    };

    // Callback for streaming tokens from Groq
    const onStreamToken = (token) => {
      if (isStreaming && token) {
        res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
      }
    };

    // Callback for when a tool starts executing
    const onToolStart = (toolName) => {
      if (isStreaming) {
        res.write(`data: ${JSON.stringify({ type: 'tool_start', tool: toolName })}\n\n`);
      }
    };

    const aiStartTime = Date.now();
    
    // Call the agent
    const result = await vetAgent.processMessageFast(
      userId,
      message,
      context,
      convIdToUse,
      onStreamToken,
      onToolStart
    );
    
    timings['AI_Processing'] = Date.now() - aiStartTime;

    // Fetch latest booking session in case a tool updated it
    const latestBookingSession = await fetchBookingSession(convIdToUse);
    const bookingState = latestBookingSession ? latestBookingSession.state : null;

    // Send final response
    if (isStreaming) {
      res.write(`data: ${JSON.stringify({ type: 'done', finalResult: result, bookingState })}\n\n`);
      res.end();
    } else {
      res.status(200).json({ success: true, data: result, bookingState });
    }

    timings['TotalRequestTime'] = Date.now() - startTime;

    // Log Performance
    console.log(`\n--- Performance Profiling [${conversationId || 'new'}] ---`);
    console.log(`Total Request Time: ${timings.TotalRequestTime} ms`);
    console.log(`- Request -> DB Starts: ${timings.RequestReceived} ms`);
    console.log(`- DB Fetches (Parallel): ${timings.DB_Fetch} ms`);
    console.log(`- AI Processing (Groq + Tools): ${timings.AI_Processing} ms`);
    console.log(`-------------------------------------------\n`);

  } catch (error) {
    console.error('AI Orchestrator Error:', error);
    
    const msg = error.message || '';
    const isRateLimit = msg.includes('rate-limited') || msg.includes('Rate limit') || msg.includes('rate_limit');
    
    let statusCode = 500;
    let errorResponse = { success: false, error: `Failed to process AI response: ${msg}`, details: msg };
    
    if (isRateLimit) {
      statusCode = 503;
      errorResponse = {
        success: false,
        error: 'AI service is temporarily unavailable due to rate limits.',
        details: msg,
        retryAfter: msg.match(/try again in (\S+)/i)?.[1] || 'a few minutes'
      };
    }

    if (req.body.stream) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: errorResponse.error })}\n\n`);
      res.end();
    } else {
      res.status(statusCode).json(errorResponse);
    }
  }
};

module.exports = {
  handleChatRequest
};
