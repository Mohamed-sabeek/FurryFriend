require('dotenv').config({ path: __dirname + '/../.env' });
const { GoogleGenAI } = require('@google/genai');

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MISSING_API_KEY') {
    console.error("❌ GEMINI_API_KEY not found in server/.env");
    process.exit(1);
  }

  let aiClient;
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("❌ Failed to initialize Google GenAI SDK:", err.message);
    process.exit(1);
  }

  try {
    console.log("Fetching available models...\n");
    const response = await aiClient.models.list();
    const models = [];
    
    for await (const model of response) {
      models.push(model);
    }

    let generateContentModels = [];
    let recommendedVisionModel = "None";

    console.log("=================================================");
    console.log("Available Gemini Models");
    console.log("=================================================");

    models.forEach(model => {
      const name = model.name;
      const displayName = model.displayName || "N/A";
      const methods = model.supportedActions || [];
      const description = model.description || "N/A";
      const inputTypes = description.toLowerCase().includes('multimodal') || name.includes('vision') ? "Text, Image/Video" : "Text";
      const outputTypes = "Text, JSON";
      const version = model.version || "N/A";
      
      let supportsGenerateContent = methods.includes('generateContent');
      if (supportsGenerateContent) {
        generateContentModels.push(model);
      }

      console.log(`Model Name: ${name}`);
      console.log(`Display Name: ${displayName}`);
      console.log(`Supported Actions: ${methods.join(', ') || 'N/A'}`);
      console.log(`Supported Input Modalities: ${inputTypes}`);
      console.log(`Supported Output Modalities: ${outputTypes}`);
      console.log(`Version: ${version}`);
      console.log(`Capabilities (Description): ${description}`);
      console.log(`Input Token Limit: ${model.inputTokenLimit || 'N/A'}`);
      console.log("--------------------------------");

      // Auto-recommend a vision model
      const isMultimodal = inputTypes.includes('Image');
      const isStable = !name.includes('preview') && !name.includes('exp');
      if (supportsGenerateContent && isMultimodal && isStable && recommendedVisionModel === "None" && name.includes('flash')) {
        recommendedVisionModel = name;
      }
    });

    console.log("\n=================================================");
    console.log("MODELS SUPPORTING generateContent");
    console.log("=================================================");
    
    generateContentModels.forEach(model => {
      console.log(`- ${model.name}`);
    });

    console.log("\n=================================================");
    console.log("SUMMARY");
    console.log("=================================================");
    console.log(`Total Models: ${models.length}`);
    console.log(`Total generateContent Models: ${generateContentModels.length}`);
    console.log(`Recommended Vision Model: ${recommendedVisionModel}`);

  } catch (error) {
    const status = error.status || error.code;
    const msg = error.message?.toLowerCase() || "";
    
    if (status === 401 || status === 403 || msg.includes('api key')) {
      console.error("❌ Invalid API Key: Permission denied.");
    } else if (status === 429 || msg.includes('quota') || msg.includes('rate limit')) {
      console.error("❌ Rate Limit Exceeded: You have hit your Google API quota.");
    } else if (msg.includes('network') || msg.includes('fetch')) {
      console.error("❌ Network Failure: Unable to reach Google API.");
    } else {
      console.error(`❌ Google SDK Error: ${error.message}`);
    }
  }
}

main();
