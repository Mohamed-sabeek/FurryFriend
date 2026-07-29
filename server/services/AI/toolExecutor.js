const { toolRegistry, setCurrentUserId, setCurrentConversationId } = require('./toolRegistry');

/**
 * Iterates through tool calls requested by the LLM and executes them safely.
 * @param {Array} toolCalls - Tool calls from the LLM response
 * @param {string} userId - Current user's MongoDB ID (needed for bookAppointment)
 * @param {string} convId - Current conversation ID
 */
const executeTools = async (toolCalls, userId, convId) => {
  if (!toolCalls || toolCalls.length === 0) return [];

  // Inject context for stateful tools
  if (userId) setCurrentUserId(userId);
  if (convId) setCurrentConversationId(convId);

  const toolResults = [];

  for (const toolCall of toolCalls) {
    const functionName = toolCall.function.name;
    const toolCallId = toolCall.id;
    let args = {};

    try {
      if (toolCall.function.arguments) {
        args = JSON.parse(toolCall.function.arguments);
      }
    } catch (e) {
      console.error('Failed to parse tool arguments:', e);
    }

    if (toolRegistry[functionName]) {
      console.log(`🔧 Executing tool: ${functionName}`, args);
      try {
        const result = await toolRegistry[functionName].execute(args);
        toolResults.push({
          tool_call_id: toolCallId,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(result)
        });
      } catch (err) {
        console.error(`Error executing tool ${functionName}:`, err);
        toolResults.push({
          tool_call_id: toolCallId,
          role: 'tool',
          name: functionName,
          content: JSON.stringify({ error: 'Tool execution failed.' })
        });
      }
    } else {
      console.warn(`Tool ${functionName} not found in registry.`);
      toolResults.push({
        tool_call_id: toolCallId,
        role: 'tool',
        name: functionName,
        content: JSON.stringify({ error: 'Tool not found.' })
      });
    }
  }

  return toolResults;
};

module.exports = {
  executeTools
};
