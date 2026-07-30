const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

let aiClient = null;
try {
  aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  console.warn("⚠️ Google GenAI initialized without an API Key. Ensure GEMINI_API_KEY is set.");
}

let dynamicModelChain = null;
let DEFAULT_GEMINI_MODEL = null;

/**
 * Fetch and build the fallback chain dynamically
 */
const getModelChain = async () => {
  if (dynamicModelChain) return dynamicModelChain;
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  try {
    const response = await aiClient.models.list();
    const models = [];
    for await (const m of response) models.push(m);

    const validModels = models.filter(m => {
      const name = m.name;
      const actions = m.supportedActions || [];
      
      const isGenerateContent = actions.includes('generateContent');
      const isExcluded = 
        name.includes('embedding') || 
        name.includes('imagen') || 
        name.includes('veo') || 
        name.includes('lyria') || 
        name.includes('audio') || 
        name.includes('tts') || 
        name.includes('robotics') || 
        name.includes('computer-use') || 
        name.includes('deep-research');

      return isGenerateContent && !isExcluded;
    });

    // Priority: Stable Flash -> Stable Pro -> Preview/Other
    const stableFlash = validModels.filter(m => m.name.includes('flash') && !m.name.includes('preview') && !m.name.includes('exp'));
    const stablePro = validModels.filter(m => m.name.includes('pro') && !m.name.includes('preview') && !m.name.includes('exp'));
    const remaining = validModels.filter(m => !stableFlash.includes(m) && !stablePro.includes(m));

    dynamicModelChain = [...stableFlash, ...stablePro, ...remaining].map(m => m.name);

    if (dynamicModelChain.length > 0) {
      DEFAULT_GEMINI_MODEL = dynamicModelChain[0];
      console.log(`✓ Selected Gemini Model:\n${DEFAULT_GEMINI_MODEL}`);
    } else {
      dynamicModelChain = ['models/gemini-2.0-flash', 'models/gemini-1.5-flash'];
      DEFAULT_GEMINI_MODEL = dynamicModelChain[0];
      console.log(`⚠️ Selected Default Gemini Model:\n${DEFAULT_GEMINI_MODEL}`);
    }
  } catch (err) {
    console.error("⚠️ Failed to dynamically fetch Gemini models, using defaults.", err.message);
    dynamicModelChain = ['models/gemini-2.0-flash', 'models/gemini-1.5-flash'];
    DEFAULT_GEMINI_MODEL = dynamicModelChain[0];
  }

  return dynamicModelChain;
};

/**
 * Helper to download an image from Cloudinary into a base64 buffer.
 * @param {string} url Cloudinary HTTPS URL
 * @returns {Promise<Object>} The inlineData object for Gemini
 */
const fetchImageAsInlineData = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    const base64Data = Buffer.from(response.data, 'binary').toString('base64');
    return {
      inlineData: {
        data: base64Data,
        mimeType
      }
    };
  } catch (error) {
    console.error(`❌ Failed to fetch image from Cloudinary: ${url}`, error.message);
    throw new Error('Failed to download image for analysis.');
  }
};

/**
 * Call Gemini Vision to analyze pet emergencies.
 */
exports.analyzeWithGeminiVision = async ({ promptText, imageUrls, responseSchema }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API Key not configured. Please add GEMINI_API_KEY to your .env file.');
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // 1. Fetch images as inlineData
  const imageParts = await Promise.all(imageUrls.map(url => fetchImageAsInlineData(url)));

  // 2. Assemble contents
  const contents = [
    {
      role: 'user',
      parts: [
        { text: promptText },
        ...imageParts
      ]
    }
  ];

  // 3. Configure Gemini Flash/Pro parameters
  const config = {
    temperature: 0.1,
    topP: 0.95,
  };

  // 4. Force JSON output if schema provided
  if (responseSchema) {
    config.responseMimeType = "application/json";
    config.responseSchema = responseSchema;
  }

  let lastError = null;
  const startTime = Date.now();
  
  const modelChain = await getModelChain();

  for (const modelName of modelChain) {
    try {
      console.log(`✓ Using Gemini Model: ${modelName}`);
      
      const response = await aiClient.models.generateContent({
        model: modelName,
        contents,
        config
      });
      
      const analysisTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
      
      let parsedData = null;
      try {
        parsedData = JSON.parse(response.text);
      } catch (parseErr) {
        throw new Error(`Gemini returned invalid JSON. Raw output: ${response.text}`);
      }

      return {
        analysis: parsedData,
        metadata: {
          model: modelName,
          analysisTime,
          generatedAt: new Date().toISOString(),
          version: "1.0"
        }
      };
    } catch (error) {
      const isRateLimit = error.status === 429 || error.message?.toLowerCase().includes('quota');
      const isNotFound = error.status === 404 || error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('no longer available');
      const isModelErr = error.status === 400;

      if (isRateLimit || isNotFound || isModelErr) {
        console.warn(`⚠️ Gemini Model ${modelName} unavailable (${error.status || 'err'}), trying next...`);
        lastError = error;
        continue;
      }

      // Non-recoverable error — throw immediately
      console.error(`❌ Gemini API Error (${modelName}):`, error.message);
      throw error;
    }
  }

  // All models exhausted
  console.error("❌ All Gemini fallback models failed.", lastError?.message);
  throw new Error('All Google Gemini models are currently unavailable. Please try again later.');
};
