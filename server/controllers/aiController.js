const vetAgent = require('../services/AI/vetAgent');
const { handleChatRequest } = require('../services/aiOrchestrator');
const {
  createConversation,
  listConversations,
  getConversationById,
  deleteConversation,
  renameConversation
} = require('../services/AI/conversationManager');
const Conversation = require('../models/Conversation');

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
const chat = async (req, res) => {
  return handleChatRequest(req, res);
};


// ─── POST /api/ai/conversations ── Create new conversation ───────────────────
const newConversation = async (req, res) => {
  try {
    const conv = await createConversation(req.user.id, 'vetconnect');
    res.status(201).json({ success: true, data: { id: conv._id, title: conv.title } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/ai/conversations ── List all conversations ─────────────────────
const getConversations = async (req, res) => {
  try {
    const list = await listConversations(req.user.id, 'vetconnect');
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/ai/conversations/:id ── Load a specific conversation ────────────
const getConversation = async (req, res) => {
  try {
    const conv = await getConversationById(req.params.id, req.user.id);
    // Return raw messages so the frontend can map tools to UI components (e.g., clinic cards, booking cards)
    const rawMessages = conv.messages;
    res.status(200).json({
      success: true,
      data: {
        id: conv._id,
        title: conv.title,
        messages: rawMessages,
        updatedAt: conv.updatedAt
      }
    });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

// ─── DELETE /api/ai/conversations/:id ────────────────────────────────────────
const removeConversation = async (req, res) => {
  try {
    await deleteConversation(req.params.id, req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── PATCH /api/ai/conversations/:id ── Rename ────────────────────────────────
const updateConversation = async (req, res) => {
  try {
    const { title } = req.body;
    await renameConversation(req.params.id, req.user.id, title);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── Legacy: GET /api/ai/history ─────────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ user: req.user.id, agent: 'vet' })
      .sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: conversation ? conversation.messages : []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch conversation history' });
  }
};

// ─── Legacy: DELETE /api/ai/history ──────────────────────────────────────────
const clearHistory = async (req, res) => {
  try {
    await Conversation.deleteMany({ user: req.user.id });
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to clear conversation history' });
  }
};

const HealthRecord = require('../models/HealthRecord');
const Vaccination = require('../models/Vaccination');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const { createChatCompletion } = require('../services/AI/groqClient');

// ─── GET /api/ai/health-summary/:petId ───────────────────────────────────────
const generateHealthSummary = async (req, res) => {
  try {
    const { petId } = req.params;
    
    // Fetch all related data
    const [pet, records, vaccinations, medications, appointments] = await Promise.all([
      Pet.findOne({ _id: petId, owner: req.user.id }),
      HealthRecord.find({ pet: petId }).sort({ visitDate: -1 }),
      Vaccination.find({ pet: petId }).sort({ vaccinatedDate: -1 }),
      Medication.find({ pet: petId }).sort({ startDate: -1 }),
      Appointment.find({ pet: petId }).sort({ date: -1 })
    ]);

    if (!pet) return res.status(404).json({ success: false, error: 'Pet not found' });

    // Calculate lastDataVersion
    const calculateMaxUpdatedAt = (docsArray) => {
      if (!docsArray || docsArray.length === 0) return 0;
      return Math.max(...docsArray.map(doc => new Date(doc.updatedAt).getTime() || 0));
    };

    const maxPetUpdate = new Date(pet.updatedAt).getTime() || 0;
    const maxRecordUpdate = calculateMaxUpdatedAt(records);
    const maxVaccineUpdate = calculateMaxUpdatedAt(vaccinations);
    const maxMedUpdate = calculateMaxUpdatedAt(medications);
    const maxApptUpdate = calculateMaxUpdatedAt(appointments);

    const lastDataVersionTime = Math.max(maxPetUpdate, maxRecordUpdate, maxVaccineUpdate, maxMedUpdate, maxApptUpdate);
    const lastDataVersionDate = new Date(lastDataVersionTime);

    // Check Cache
    if (
      pet.aiSummaryCached &&
      pet.aiSummaryCached.summary &&
      pet.aiSummaryCached.lastDataVersion &&
      pet.aiSummaryCached.lastDataVersion.getTime() >= lastDataVersionTime
    ) {
      console.log('Returning cached AI Health Summary');
      return res.status(200).json({ success: true, data: pet.aiSummaryCached.summary, cached: true });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    const systemPrompt = `You are a veterinary AI assistant. Your task is to analyze the provided pet health data and generate a structured JSON health summary.
You MUST respond ONLY with a valid JSON object. Do not include markdown formatting or explanation text.
Do NOT diagnose diseases (e.g., do not say "Your pet has cancer" or "Immediate surgery required").
Only summarize the available medical records and provide preventive wellness recommendations.
Never use placeholder data or invent dates. Calculate all relative dates (like "yesterday", "5 days ago", "in 2 weeks") based on Today's Date.

Today's Date: ${todayDate}

The JSON must follow this exact structure, replacing the descriptions with your dynamically generated content based strictly on the provided data:
{
  "healthScore": 100, // Number. Calculate: Start at 100. Subtract 10 for overdue vaccine, 5 for missed appointment, 8 for active illness, 5 for chronic disease, 5 for obesity.
  "currentStatus": "Dynamically summarize the pet's general health, any active illnesses, and when the last checkup was completed using relative dates.",
  "vaccinationStatus": "List the status of vaccines. Use '✓ [Name] completed' for done, and '⚠ [Name] due in [relative time]' for upcoming/overdue.",
  "medicationStatus": "List active medications and their remaining duration, or state 'No active medications.' if none.",
  "healthHistory": "Calculate total counts: e.g. 'X vet visits\\nY vaccinations\\nZ surgeries\\nW chronic diseases'.",
  "upcomingEvents": "List upcoming appointments, vaccines, or medication ends, sorted by nearest date.",
  "aiSuggestions": [
    "Generate 2-4 personalized suggestions based strictly on the records (e.g. scheduling a booster if overdue, weight management if heavy)."
  ]
}

Analyze the following data to generate the response:
Pet Profile: ${JSON.stringify(pet)}
Medical History: ${JSON.stringify(records)}
Vaccinations: ${JSON.stringify(vaccinations)}
Medications: ${JSON.stringify(medications)}
Upcoming Appointments: ${JSON.stringify(appointments)}
`;

    let aiResponse;
    try {
      const chatResponse = await createChatCompletion({
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.2
      });
      
      try {
        aiResponse = JSON.parse(chatResponse.content);
      } catch (e) {
        const jsonMatch = chatResponse.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON from AI');
        }
      }

      // Formatter Layer: Ensure no raw objects/arrays are exposed to UI (except aiSuggestions which is an array of strings)
      const formatField = (fieldData) => {
        if (!fieldData) return null;
        if (Array.isArray(fieldData)) {
          return fieldData.map(item => {
             if (typeof item === 'object') {
               return Object.entries(item)
                 .filter(([k,v]) => v) // filter empty
                 .map(([k,v]) => `${v}`).join(' • ');
             }
             return `• ${item}`;
          }).join('\n\n');
        }
        if (typeof fieldData === 'object') {
          return Object.entries(fieldData)
             .filter(([k,v]) => v)
             .map(([k,v]) => `${k}: ${v}`).join('\n');
        }
        return String(fieldData);
      };

      aiResponse.upcomingEvents = formatField(aiResponse.upcomingEvents);
      aiResponse.healthHistory = formatField(aiResponse.healthHistory);
      aiResponse.vaccinationStatus = formatField(aiResponse.vaccinationStatus);
      aiResponse.medicationStatus = formatField(aiResponse.medicationStatus);
      aiResponse.currentStatus = formatField(aiResponse.currentStatus);

      // Save to cache without triggering the updatedAt timestamp bump
      const updatedCache = {
        summary: aiResponse,
        generatedAt: new Date(),
        lastDataVersion: lastDataVersionDate
      };
      await Pet.updateOne(
        { _id: pet._id },
        { $set: { aiSummaryCached: updatedCache } },
        { timestamps: false }
      );

      res.status(200).json({ success: true, data: aiResponse });
    } catch (groqError) {
      console.error('Groq Generation Failed:', groqError.message);
      
      // Fallback: If Groq fails but we have a cache, use it instead of throwing error
      if (pet.aiSummaryCached && pet.aiSummaryCached.summary) {
        return res.status(200).json({ 
          success: true, 
          data: pet.aiSummaryCached.summary, 
          cached: true, 
          warning: 'Live generation failed, showing last known summary.' 
        });
      }
      
      throw groqError;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  chat,
  newConversation,
  getConversations,
  getConversation,
  removeConversation,
  updateConversation,
  getHistory,
  clearHistory,
  generateHealthSummary
};
