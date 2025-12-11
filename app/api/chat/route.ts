import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getServerSession } from 'next-auth';

const SPECIALISTS: Record<string, {
    title: string;
    scope: string[];
    medicines: string[];
}> = {
    general: {
        title: "General Doctor",
        scope: ["heart", "blood pressure", "general", "wellness", "fever", "fatigue", "weakness", "tired", "sick", "temperature"],
        medicines: ["Paracetamol 500mg", "Ibuprofen 400mg", "Vitamin C"]
    },
    eye: {
        title: "Eye Doctor",
        scope: ["eye", "vision", "sight", "blind", "blur", "red eye", "itchy eye", "watery", "conjunctivitis", "glasses", "cataract", "see", "eyes"],
        medicines: ["Artificial Tears", "Tobramycin eye drops", "Ciprofloxacin eye drops"]
    },
    orthopedic: {
        title: "Bone Doctor",
        scope: ["bone", "joint", "muscle", "back", "spine", "knee", "shoulder", "fracture", "arthritis", "sprain", "ankle", "wrist", "hip", "leg", "arm"],
        medicines: ["Diclofenac 50mg", "Calcium + Vitamin D", "Glucosamine"]
    },
    neurology: {
        title: "Brain Doctor",
        scope: ["headache", "migraine", "dizzy", "vertigo", "seizure", "numbness", "tingling", "memory", "brain", "nerve", "tremor", "head"],
        medicines: ["Sumatriptan 50mg", "Amitriptyline 25mg", "Gabapentin 300mg"]
    },
    respiratory: {
        title: "Lung Doctor",
        scope: ["cough", "breathing", "asthma", "bronchitis", "chest", "lung", "wheeze", "shortness of breath", "pneumonia", "cold", "flu", "breath"],
        medicines: ["Salbutamol inhaler", "Amoxicillin 500mg", "Cough syrup"]
    },
    digestive: {
        title: "Stomach Doctor",
        scope: ["stomach", "nausea", "vomit", "diarrhea", "constipation", "acid", "heartburn", "bloating", "appetite", "digestion", "ulcer", "eat", "food", "belly"],
        medicines: ["Omeprazole 20mg", "Loperamide", "Antacid", "Probiotics"]
    }
};

// Find which specialist matches the symptoms
function findMatchingSpecialist(message: string): { key: string; title: string } | null {
    const lower = message.toLowerCase();

    for (const [key, spec] of Object.entries(SPECIALISTS)) {
        if (spec.scope.some(keyword => lower.includes(keyword))) {
            return { key, title: spec.title };
        }
    }
    return null;
}

function getResponse(message: string, specialty: string): string {
    const doc = SPECIALISTS[specialty] || SPECIALISTS.general;
    const lower = message.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || message.length < 8) {
        return `Hello! I'm your ${doc.title}. What symptoms are you experiencing today?`;
    }

    if (lower.includes('thank')) {
        return "You're welcome. Take care, and come back if you need anything.";
    }

    // Check if symptoms match a DIFFERENT specialist
    const matchingSpec = findMatchingSpecialist(message);
    if (matchingSpec && matchingSpec.key !== specialty) {
        return `Those symptoms sound like they need attention from our ${matchingSpec.title}. Please go back to the dashboard and select "${matchingSpec.title}" for the best care.`;
    }

    // In scope - give consultation response
    if (lower.includes('pain')) return "I understand you're in pain. Can you rate it from 1 to 10? How long have you had this?";
    if (lower.includes('how long')) return "That's helpful information. Is there anything that makes it better or worse?";

    return "I understand. Tell me more about when this started and how severe it is.";
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: true, message: "Please sign in first." });
        }

        const { message, specialty = 'general' } = await request.json();
        const doc = SPECIALISTS[specialty] || SPECIALISTS.general;

        if (!message?.trim()) {
            return NextResponse.json({ success: true, message: "I didn't catch that. Please repeat." });
        }

        const lower = message.toLowerCase();
        const isGreeting = lower.includes('hello') || lower.includes('hi') || lower.includes('thank') || message.length < 10;

        // Check if symptoms match a different specialist
        const matchingSpec = findMatchingSpecialist(message);
        if (matchingSpec && matchingSpec.key !== specialty && !isGreeting) {
            return NextResponse.json({
                success: true,
                message: `Those symptoms sound like they need our ${matchingSpec.title}. Please go back to the dashboard and select "${matchingSpec.title}" - they can help you better with this.`,
                redirect: matchingSpec.key
            });
        }

        // Try Vercel AI SDK with OpenAI
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (openaiApiKey) {
            try {
                const prompt = `You are a ${doc.title}. Your specialty: ${doc.scope.slice(0, 6).join(', ')}.

RULES:
- Speak ONLY English
- Do NOT recommend or mention any medicines
- Just ask questions to understand the patient's condition
- Keep responses to 2 short sentences
- Be warm and professional
- Ask about duration, severity, or related symptoms

Patient says: "${message}"

Respond naturally:`;

                const { text } = await generateText({
                    model: openai('gpt-4o-mini'),
                    prompt: prompt,
                    maxTokens: 100,
                });

                return NextResponse.json({ success: true, message: text });

            } catch (error) {
                console.error('OpenAI API error:', error);
                // Fall through to fallback response
            }
        }

        // Fallback to rule-based responses if no API key or API fails
        return NextResponse.json({ success: true, message: getResponse(message, specialty) });

    } catch {
        return NextResponse.json({ success: true, message: "Please describe your symptoms again." });
    }
}

export { SPECIALISTS };
