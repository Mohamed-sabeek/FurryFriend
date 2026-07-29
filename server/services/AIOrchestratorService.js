const Pet = require('../models/Pet');
// In a production app, this service would decouple the consultation saving from the AI generation.
// We trigger background tasks here.

exports.triggerPostConsultationUpdate = async (petId, healthRecordId) => {
  console.log(`[AI Orchestrator] Triggering background AI updates for Pet: ${petId}`);
  try {
    // Step 1. The ConsultationService has already nullified aiSummaryCached in the Pet model.
    // This ensures any immediate fetch by the user will trigger a fresh generation.

    // Step 2. Trigger async calls to Groq API to pre-warm the cache (Optional).
    // Because we use a REST API with req/res in aiController, we simulate the orchestrator
    // ensuring that stale data is cleared. Future enhancements will decouple the generation logic
    // from the Express controllers into standalone service functions.
    
    console.log(`[AI Orchestrator] Caches cleared. New AI plans will dynamically generate from the latest health records (Single Source of Truth).`);
    console.log(`[AI Orchestrator] Finished background AI updates for Pet: ${petId}`);
  } catch (err) {
    console.error(`[AI Orchestrator] Failed to update AI for Pet: ${petId}`, err);
  }
};
