import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
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
        scope: ["eye", "vision", "sight", "blind", "blur", "red eye", "itchy eye", "watery", "conjunctivitis", "glasses", "cataract", "see", "eyes", "night"],
        medicines: ["Artificial Tears", "Tobramycin eye drops", "Ciprofloxacin eye drops"]
    },
    orthopedic: {
        title: "Bone Doctor",
        scope: ["bone", "joint", "muscle", "back", "spine", "knee", "shoulder", "fracture", "arthritis", "sprain", "ankle", "wrist", "hip", "leg", "arm"],
        medicines: ["Diclofenac 50mg", "Calcium + Vitamin D", "Glucosamine"]
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

// Check if message is ONLY a greeting
function isOnlyGreeting(msg: string): boolean {
    const m = msg.toLowerCase().trim();
    const pureGreetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'hi doctor', 'hello doctor'];
    return pureGreetings.includes(m) || pureGreetings.some(g => m === g + '!' || m === g + '.');
}

// Better fallback responses based on context
function getSmartResponse(message: string, specialty: string): string {
    const doc = SPECIALISTS[specialty] || SPECIALISTS.general;
    const lower = message.toLowerCase().trim();

    // Only respond with greeting for PURE greetings
    if (isOnlyGreeting(message)) {
        return `Hello! I'm your ${doc.title}. What symptoms are you experiencing today?`;
    }

    // Handle short answers like "no", "yes"
    if (lower === 'no' || lower === 'nope' || lower === 'not really' || lower === 'nothing') {
        return "Alright, based on what you've described, I'd recommend a proper examination. Is there anything else you'd like to discuss?";
    }
    if (lower === 'yes' || lower === 'yeah' || lower === 'yep' || lower === 'ok') {
        return "Can you tell me more about that?";
    }

    if (lower.includes('thank')) {
        return "You're welcome. Take care, and come back if you need anything.";
    }

    // More specific responses based on keywords
    if (lower.includes('night') || lower.includes('dark')) {
        return "Night vision problems can have several causes. How long have you been experiencing this? Do you also have trouble in dim lighting?";
    }

    if (lower.includes('severe') || lower.includes('bad') || lower.includes('worse')) {
        return "I'm sorry to hear it's severe. Have you experienced any other symptoms like pain, headaches, or sensitivity to light?";
    }

    if (lower.includes('started') || lower.includes('ago') || lower.includes('days') || lower.includes('week')) {
        return "Thank you for that information. Has it been getting progressively worse, or has it stayed the same since it started?";
    }

    if (lower.includes('pain')) {
        return "I understand you're in pain. Can you rate it from 1 to 10? Does anything make it better or worse?";
    }

    if (lower.includes('can\'t see') || lower.includes('cannot see') || lower.includes('don\'t see')) {
        return "Vision problems are concerning. Is the blurriness constant or does it come and go? Any pain or redness?";
    }

    if (lower.includes('blur') || lower.includes('blurry')) {
        return "Blurry vision can have many causes. Is it in one eye or both? Do you wear glasses or contacts?";
    }

    // Eye-specific symptoms
    if (lower.includes('cry') || lower.includes('tear') || lower.includes('watery')) {
        return "Excessive tearing can have various causes like allergies or blocked tear ducts. Is there any itching, redness, or discharge?";
    }

    if (lower.includes('can\'t look') || lower.includes('cannot look') || lower.includes('look well')) {
        return "Can you describe what happens when you try to see? Is it blurry, double vision, or something else?";
    }

    if (lower.includes('disease') || lower.includes('problem') || lower.includes('issue') || lower.includes('trouble')) {
        return "I understand. Can you describe specifically what you're experiencing? For example, is it pain, blurriness, or something else?";
    }

    if (lower.includes('poor vision') || lower.includes('vision problem')) {
        return "Vision problems need careful evaluation. Is it constant or does it come and go? One eye or both?";
    }

    // Default follow-up questions
    const followUps = [
        "I see. Can you describe how this affects your daily activities?",
        "That's helpful. Are there any other symptoms you've noticed?",
        "Thank you for sharing. Has this happened before, or is this the first time?",
        "I understand. On a scale of 1-10, how would you rate the severity?",
    ];

    return followUps[Math.floor(Math.random() * followUps.length)];
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

        const lower = message.toLowerCase().trim();
        const isGreeting = isOnlyGreeting(message) || lower.includes('thank');

        // Check if symptoms match a different specialist
        const matchingSpec = findMatchingSpecialist(message);
        if (matchingSpec && matchingSpec.key !== specialty && !isGreeting) {
            return NextResponse.json({
                success: true,
                message: `Those symptoms sound like they need our ${matchingSpec.title}. Please go back to the dashboard and select "${matchingSpec.title}" - they can help you better with this.`,
                redirect: matchingSpec.key
            });
        }

        // Try Gemini AI
        const geminiApiKey = process.env.GEMINI_API_KEY;
        console.log('Gemini API Key present:', !!geminiApiKey, 'Length:', geminiApiKey?.length || 0);

        if (geminiApiKey) {
            try {
                const ai = new GoogleGenAI({ apiKey: geminiApiKey });

                const prompt = `You are a ${doc.title} having a medical consultation. Your specialty includes: ${doc.scope.slice(0, 6).join(', ')}.

RULES:
- Respond ONLY in English
- Do NOT recommend or mention any medicines or treatments
- Ask follow-up questions to understand the patient's condition better
- Keep response to 2-3 short sentences
- Be warm, empathetic and professional
- Ask about: duration, severity, triggers, other symptoms

Patient says: "${message}"

Your response:`;

                console.log('Sending request to Gemini...');
                const response = await ai.models.generateContent({
                    model: 'gemini-2.0-flash',
                    contents: prompt,
                });

                const responseText = response.text;
                console.log('Gemini response received, length:', responseText?.length || 0);

                if (responseText && responseText.trim()) {
                    return NextResponse.json({ success: true, message: responseText.trim() });
                }
            } catch (error) {
                console.error('Gemini API error details:', error instanceof Error ? error.message : String(error));
                // Continue to smart fallback
            }
        } else {
            console.log('No GEMINI_API_KEY found in environment');
        }

        // Smart fallback responses
        return NextResponse.json({ success: true, message: getSmartResponse(message, specialty) });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ success: true, message: "I'm sorry, could you please repeat that?" });
    }
}

export { SPECIALISTS };
