/**
 * Chat API Unit Tests
 * Tests for /api/chat route functionality
 */

// Mock the modules
jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: {
            generateContent: jest.fn().mockResolvedValue({
                text: 'This is a mock AI response. How long have you been experiencing this?'
            })
        }
    }))
}));

jest.mock('next-auth', () => ({
    getServerSession: jest.fn()
}));

import { getServerSession } from 'next-auth';

// Import the functions to test
const SPECIALISTS = {
    general: {
        title: "General Doctor",
        scope: ["heart", "blood pressure", "general", "wellness", "fever", "fatigue"],
        medicines: ["Paracetamol 500mg", "Ibuprofen 400mg"]
    },
    eye: {
        title: "Eye Doctor",
        scope: ["eye", "vision", "sight", "blind", "blur", "see", "eyes"],
        medicines: ["Artificial Tears", "Tobramycin eye drops"]
    },
    orthopedic: {
        title: "Bone Doctor",
        scope: ["bone", "joint", "muscle", "back", "spine", "knee"],
        medicines: ["Diclofenac 50mg", "Calcium + Vitamin D"]
    },
    respiratory: {
        title: "Lung Doctor",
        scope: ["cough", "breathing", "asthma", "bronchitis", "chest", "lung"],
        medicines: ["Salbutamol inhaler", "Amoxicillin 500mg"]
    },
    digestive: {
        title: "Stomach Doctor",
        scope: ["stomach", "nausea", "vomit", "diarrhea", "constipation"],
        medicines: ["Omeprazole 20mg", "Loperamide"]
    }
};

// Helper functions from route.ts (copied for testing)
function findMatchingSpecialist(message: string): { key: string; title: string } | null {
    const lower = message.toLowerCase();
    for (const [key, spec] of Object.entries(SPECIALISTS)) {
        if (spec.scope.some(keyword => lower.includes(keyword))) {
            return { key, title: spec.title };
        }
    }
    return null;
}

function isOnlyGreeting(msg: string): boolean {
    const m = msg.toLowerCase().trim();
    const pureGreetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'hi doctor', 'hello doctor'];
    return pureGreetings.includes(m) || pureGreetings.some(g => m === g + '!' || m === g + '.');
}

describe('Chat API - Specialist Matching', () => {
    test('should match eye symptoms to eye specialist', () => {
        const result = findMatchingSpecialist('I have vision problems');
        expect(result).not.toBeNull();
        expect(result?.key).toBe('eye');
        expect(result?.title).toBe('Eye Doctor');
    });

    test('should match bone symptoms to orthopedic specialist', () => {
        const result = findMatchingSpecialist('My back hurts a lot');
        expect(result).not.toBeNull();
        expect(result?.key).toBe('orthopedic');
    });

    test('should match breathing symptoms to respiratory specialist', () => {
        const result = findMatchingSpecialist('I have difficulty breathing');
        expect(result).not.toBeNull();
        expect(result?.key).toBe('respiratory');
    });

    test('should match stomach symptoms to digestive specialist', () => {
        const result = findMatchingSpecialist('I have stomach pain and nausea');
        expect(result).not.toBeNull();
        expect(result?.key).toBe('digestive');
    });

    test('should match fever to general specialist', () => {
        const result = findMatchingSpecialist('I have a fever');
        expect(result).not.toBeNull();
        expect(result?.key).toBe('general');
    });

    test('should return null for unrelated message', () => {
        const result = findMatchingSpecialist('Hello doctor');
        expect(result).toBeNull();
    });
});

describe('Chat API - Greeting Detection', () => {
    test('should detect pure "hello" as greeting', () => {
        expect(isOnlyGreeting('hello')).toBe(true);
    });

    test('should detect pure "hi" as greeting', () => {
        expect(isOnlyGreeting('hi')).toBe(true);
    });

    test('should detect "hi doctor" as greeting', () => {
        expect(isOnlyGreeting('hi doctor')).toBe(true);
    });

    test('should detect "good morning" as greeting', () => {
        expect(isOnlyGreeting('good morning')).toBe(true);
    });

    test('should NOT detect "hello I have pain" as pure greeting', () => {
        expect(isOnlyGreeting('hello I have pain')).toBe(false);
    });

    test('should NOT detect symptom description as greeting', () => {
        expect(isOnlyGreeting('my eye hurts')).toBe(false);
    });

    test('should handle greetings with punctuation', () => {
        expect(isOnlyGreeting('hello!')).toBe(true);
        expect(isOnlyGreeting('hi.')).toBe(true);
    });
});

describe('Chat API - End Conversation Detection', () => {
    const endPhrases = [
        'no', 'nope', 'not really', 'nothing',
        "that's all", 'thats all', 'done', 'finished',
        'nothing else', 'no other'
    ];

    test.each(endPhrases)('should detect "%s" as end of conversation', (phrase) => {
        const lower = phrase.toLowerCase().trim();
        const isEnd = lower === 'no' || lower === 'nope' || lower === 'not really' || lower === 'nothing' ||
            lower === 'no other' || lower === 'no concern' || lower.includes("that's all") ||
            lower.includes('thats all') || lower.includes('done') || lower.includes('finished') ||
            lower.includes('end') || lower.includes('stop') || lower.includes('nothing else');
        expect(isEnd).toBe(true);
    });

    test('should NOT detect symptom description as end', () => {
        const message = 'I have more pain today';
        const lower = message.toLowerCase().trim();
        const isEnd = lower === 'no' || lower.includes("that's all");
        expect(isEnd).toBe(false);
    });
});

describe('Chat API - Specialists Configuration', () => {
    test('should have 5 specialists configured', () => {
        expect(Object.keys(SPECIALISTS)).toHaveLength(5);
    });

    test('each specialist should have title, scope, and medicines', () => {
        Object.values(SPECIALISTS).forEach(spec => {
            expect(spec).toHaveProperty('title');
            expect(spec).toHaveProperty('scope');
            expect(spec).toHaveProperty('medicines');
            expect(Array.isArray(spec.scope)).toBe(true);
            expect(Array.isArray(spec.medicines)).toBe(true);
        });
    });

    test('general specialist should be available', () => {
        expect(SPECIALISTS.general).toBeDefined();
        expect(SPECIALISTS.general.title).toBe('General Doctor');
    });
});
