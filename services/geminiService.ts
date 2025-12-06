import { GoogleGenAI } from "@google/genai";
import { STRATEGIES } from '../constants';

// Initialize the API client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are a world-class Options Trading Mentor. 
You are helpful, concise, and educational.
You have context about a specific list of strategies available in the user's application:
${STRATEGIES.map(s => `- ${s.name} (${s.engName}): ${s.usage}`).join('\n')}

When a user asks a question:
1. Identify if they are asking about a specific strategy.
2. Explain clearly in Traditional Chinese (繁體中文).
3. Warn about risks (Risk Warning) when appropriate.
4. Keep answers under 200 words unless asked for details.
`;

export const sendMessageToGemini = async (message: string, history: {role: string, parts: {text: string}[]}[] = []): Promise<string> => {
  if (!apiKey) {
    return "請配置 API Key 以使用 AI 助手功能。";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    // Convert history format to what @google/genai expects if needed, 
    // but here we will just use a fresh generateContent for simplicity as per "Basic Text Tasks" guidance
    // utilizing the history context in the prompt or system instruction if we were doing a full Chat session.
    // For a simple Q&A assistant in this scope, single turn with context is often sufficient, 
    // but let's use the chat feature for better conversational flow.

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const result = await chat.sendMessage({
      message: message
    });

    return result.text || "抱歉，我無法產生回應。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "發生錯誤，請稍後再試。";
  }
};