const { analyzeWithGeminiVision } = require('./AI/geminiClient');

class PetEmergencyAIService {
  /**
   * Analyze pet emergency context and images via Gemini 2.5 Flash Vision.
   * @param {Object} context The structured context from EmergencyContextService
   * @param {Array<Object>} images Array of Cloudinary image objects { secure_url, public_id }
   * @returns {Object} JSON payload { analysis: {...}, metadata: {...} }
   */
  static async analyzeEmergency(context, images) {
    const imageUrls = images.map(img => img.secure_url);

    const promptText = `
You are an experienced veterinary emergency triage assistant. 
Analyze the uploaded emergency images carefully along with the pet's comprehensive medical context.
Never claim certainty. Describe only what is visible.
Use the pet profile and medical history to inform your triage.
Estimate the emergency severity, provide safe first aid instructions, and strongly advise on what NOT to do.
Recommend whether immediate veterinary care is required.

PET CONTEXT:
${JSON.stringify(context, null, 2)}

Important rules:
1. If the emergency is repeated based on the previousEmergencies context, point it out in "visibleFindings" and suggest addressing it in "preventionTips".
2. If the image is unclear or irrelevant, reduce "confidence" and state that in "visibleFindings".
3. Never hallucinate diagnoses. Provide 'possibleConditions'.
    `;

    // Define the exact JSON schema required by the user
    const responseSchema = {
      type: "OBJECT",
      properties: {
        severity: { type: "STRING", enum: ["Low", "Moderate", "Critical", "Unknown"] },
        confidence: { type: "INTEGER" },
        visibleFindings: { type: "ARRAY", items: { type: "STRING" } },
        possibleConditions: { type: "ARRAY", items: { type: "STRING" } },
        firstAid: { type: "ARRAY", items: { type: "STRING" } },
        doNotDo: { type: "ARRAY", items: { type: "STRING" } },
        visitVet: { type: "BOOLEAN" },
        visitWithin: { type: "STRING" },
        recommendedProducts: { type: "ARRAY", items: { type: "STRING" } },
        preventionTips: { type: "ARRAY", items: { type: "STRING" } },
        followUpAdvice: { type: "ARRAY", items: { type: "STRING" } },
        disclaimer: { type: "STRING" }
      },
      required: [
        "severity", "confidence", "visibleFindings", "possibleConditions", 
        "firstAid", "doNotDo", "visitVet", "visitWithin", "preventionTips", "disclaimer"
      ]
    };

    try {
      const result = await analyzeWithGeminiVision({
        promptText,
        imageUrls,
        responseSchema
      });

      return result; // Returns { analysis: {}, metadata: {} }
    } catch (error) {
      console.error('PetEmergencyAIService Error:', error.message);
      throw error;
    }
  }
}

module.exports = PetEmergencyAIService;
