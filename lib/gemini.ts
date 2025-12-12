import { GoogleGenAI } from '@google/genai';
import { MEDICAL_SYSTEM_PROMPT, generateMedicalPrompt } from './ai-prompt';

export async function getMedicalResponse(transcript: string): Promise<string> {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not found');
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `${MEDICAL_SYSTEM_PROMPT}\n\n${generateMedicalPrompt(transcript)}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        return response.text || 'I could not generate a response.';
    } catch (error) {
        console.error('Error getting AI response:', error);
        throw new Error('Failed to get AI response');
    }
}
