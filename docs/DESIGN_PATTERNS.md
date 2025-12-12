# Software Design Patterns Documentation

## AI Medical Voice Agent - Design Patterns

This document outlines the software design patterns used in the AI Medical Voice Agent application.

---

## 1. Observer Pattern

**Location:** `app/(dashboard)/consultation/page.tsx`

**Description:** The Observer pattern is used for handling speech recognition events. The SpeechRecognition API acts as the subject, and our component observes events like `onresult`, `onend`, and `onerror`.

```typescript
// Observer Pattern Implementation
recognition.onresult = (event) => {
    // Observer reacts to speech recognition results
    setCurrentTranscript(transcript);
};

recognition.onend = () => {
    // Observer reacts to recognition ending
    if (isListeningRef.current) {
        recognition.start(); // Auto-restart
    }
};

recognition.onerror = (event) => {
    // Observer reacts to errors
    console.log("Speech error:", event.error);
};
```

**Benefits:**
- Loose coupling between speech recognition and UI
- Easy to add/remove event handlers
- Automatic state updates on events

---

## 2. Strategy Pattern

**Location:** `app/api/chat/route.ts`

**Description:** The Strategy pattern is used for handling different medical specialists. Each specialist has its own strategy for responding to symptoms.

```typescript
// Strategy Pattern Implementation
const SPECIALISTS: Record<string, {
    title: string;
    scope: string[];
    medicines: string[];
}> = {
    general: {
        title: "General Doctor",
        scope: ["heart", "blood pressure", "fever"...],
        medicines: ["Paracetamol", "Ibuprofen"...]
    },
    eye: {
        title: "Eye Doctor",
        scope: ["eye", "vision", "blur"...],
        medicines: ["Artificial Tears"...]
    },
    // ... other specialists
};

// Strategy selection at runtime
const doc = SPECIALISTS[specialty] || SPECIALISTS.general;
```

**Benefits:**
- Easy to add new specialists without modifying existing code
- Encapsulates specialist-specific behavior
- Runtime strategy selection based on user choice

---

## 3. Singleton Pattern

**Location:** `config/db.tsx`

**Description:** The database connection uses the Singleton pattern to ensure only one connection pool exists throughout the application lifecycle.

```typescript
// Singleton Pattern Implementation
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql); // Single instance
```

**Benefits:**
- Single database connection pool
- Resource efficiency
- Consistent state across the application

---

## 4. Factory Pattern

**Location:** `app/api/auth/[...nextauth]/route.ts`

**Description:** NextAuth uses the Factory pattern to create authentication providers.

```typescript
// Factory Pattern Implementation
providers: [
    CredentialsProvider({
        name: "credentials",
        credentials: { ... },
        async authorize(credentials) {
            // Factory creates authenticated user
            return user;
        }
    }),
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
]
```

**Benefits:**
- Abstracts provider creation
- Easy to add new auth providers
- Consistent interface for all providers

---

## 5. Module Pattern

**Location:** Throughout the codebase (`lib/`, `config/`)

**Description:** The Module pattern is used to encapsulate related functionality into separate modules.

```
lib/
├── gemini.ts      # AI communication module
├── ai-prompt.ts   # Prompt generation module
config/
├── db.tsx         # Database module
├── schema.tsx     # Database schema module
```

**Benefits:**
- Code organization
- Encapsulation
- Reusability

---

## 6. Proxy Pattern

**Location:** `middleware.ts`

**Description:** The middleware acts as a proxy to protect routes and manage authentication.

```typescript
// Proxy Pattern Implementation
export function middleware(request: NextRequest) {
    const token = request.cookies.get("next-auth.session-token");
    
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!token) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
    }
    
    return NextResponse.next();
}
```

**Benefits:**
- Access control
- Request interception
- Centralized authentication logic

---

## Summary

| Pattern | Location | Purpose |
|---------|----------|---------|
| Observer | Voice Recognition | Handle speech events |
| Strategy | Specialists | Different doctor behaviors |
| Singleton | Database | Single connection |
| Factory | Authentication | Create auth providers |
| Module | lib/, config/ | Code organization |
| Proxy | Middleware | Route protection |

---

## UML Class Diagram (Simplified)

```
┌─────────────────────┐     ┌─────────────────────┐
│   ConsultationPage  │     │    ChatAPI          │
├─────────────────────┤     ├─────────────────────┤
│ - isListening       │     │ - SPECIALISTS       │
│ - messages          │────▶│ - findSpecialist()  │
│ - currentTranscript │     │ - getSmartResponse()│
├─────────────────────┤     └─────────────────────┘
│ + startListening()  │              │
│ + stopListening()   │              ▼
│ + handleSendMessage()│     ┌─────────────────────┐
└─────────────────────┘     │   GoogleGenAI       │
         │                  ├─────────────────────┤
         ▼                  │ + generateContent() │
┌─────────────────────┐     └─────────────────────┘
│ SpeechRecognition   │
├─────────────────────┤
│ + start()           │
│ + stop()            │
│ + onresult          │
│ + onend             │
└─────────────────────┘
```
