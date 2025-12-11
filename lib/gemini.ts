import { GoogleGenerativeAI } from '@google/generative-ai';
import { MEDICAL_SYSTEM_PROMPT, generateMedicalPrompt } from './ai-prompt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getMedicalResponse(transcript: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: 'You are a medical assistant. Please acknowledge and follow these instructions.' }],
                },
                {
                    role: 'model',
                    parts: [{ text: MEDICAL_SYSTEM_PROMPT }],
                },
            ],
        });

        const result = await chat.sendMessage(generateMedicalPrompt(transcript));
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error getting AI response:', error);
        throw new Error('Failed to get AI response');
    }
}
