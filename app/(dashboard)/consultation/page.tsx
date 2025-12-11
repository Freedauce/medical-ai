"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
    IconMicrophone,
    IconMicrophoneOff,
    IconVolume,
    IconVolumeOff,
    IconLoader2,
    IconUser,
    IconArrowLeft,
    IconFileText,
    IconX,
    IconDownload,
    IconCheck,
    IconHeart,
    IconEye,
    IconBone,
    IconBrain,
    IconLungs,
    IconApple,
    IconArrowRight
} from "@tabler/icons-react";
import Link from "next/link";

interface Message {
    role: "user" | "assistant";
    content: string;
    redirect?: string;
}

const SPECIALISTS: Record<string, { title: string; icon: React.ElementType; color: string; medicines: string[] }> = {
    general: { title: "General Doctor", icon: IconHeart, color: "from-red-500 to-pink-500", medicines: ["Paracetamol 500mg - Take 1 tablet every 6 hours", "Ibuprofen 400mg - Take 1 twice daily with food", "Vitamin C 1000mg - Take 1 daily"] },
    eye: { title: "Eye Doctor", icon: IconEye, color: "from-blue-500 to-cyan-500", medicines: ["Artificial Tears - Apply 1-2 drops 4 times daily", "Tobramycin drops - 1 drop 3 times daily for 7 days"] },
    orthopedic: { title: "Bone Doctor", icon: IconBone, color: "from-orange-500 to-amber-500", medicines: ["Diclofenac 50mg - 1 tablet twice daily", "Calcium + Vitamin D - 1 tablet daily", "Ice pack 15 mins, 3 times daily"] },
    neurology: { title: "Brain Doctor", icon: IconBrain, color: "from-purple-500 to-violet-500", medicines: ["Sumatriptan 50mg - 1 at migraine onset", "Amitriptyline 25mg - 1 at bedtime"] },
    respiratory: { title: "Lung Doctor", icon: IconLungs, color: "from-teal-500 to-emerald-500", medicines: ["Salbutamol inhaler - 2 puffs when needed", "Amoxicillin 500mg - 1 tablet 3 times daily"] },
    digestive: { title: "Stomach Doctor", icon: IconApple, color: "from-yellow-500 to-lime-500", medicines: ["Omeprazole 20mg - 1 before breakfast", "Loperamide 2mg - 2 initially, 1 after each loose stool"] },
};

// Loading component for Suspense fallback
function ConsultationLoading() {
    return (
        <div className="flex h-[calc(100vh-120px)] items-center justify-center">
            <div className="text-center">
                <IconLoader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
                <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading consultation...</p>
            </div>
        </div>
    );
}

// Main consultation content component
function ConsultationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const specialty = searchParams.get("specialty") || "general";
    const doc = SPECIALISTS[specialty] || SPECIALISTS.general;
    const DocIcon = doc.icon;

    const [messages, setMessages] = useState<Message[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState("");
    const [showReport, setShowReport] = useState(false);
    const [report, setReport] = useState("");
    const [suggestedDoctor, setSuggestedDoctor] = useState<string | null>(null);
    const [autoMode, setAutoMode] = useState(true); // Auto-listen mode

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const finalTranscriptRef = useRef("");

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window === "undefined") return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after each phrase for cleaner results
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            let interim = "";
            let final = "";

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript + " ";
                } else {
                    interim += result[0].transcript;
                }
            }

            // Build full transcript from final + interim
            const fullTranscript = (finalTranscriptRef.current + final + interim).trim();
            setCurrentTranscript(fullTranscript);

            // If we got a final result, save it
            if (final) {
                finalTranscriptRef.current += final;
            }

            // Reset silence timer on any speech
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

            // Set silence timer - send after 1.5 seconds of silence
            if (fullTranscript) {
                silenceTimerRef.current = setTimeout(() => {
                    if (isListening && fullTranscript.trim()) {
                        sendMessage(fullTranscript.trim());
                    }
                }, 1500);
            }
        };

        recognition.onend = () => {
            // Auto-restart if still in listening mode and not loading
            if (isListening && !isLoading && !isSpeaking && autoMode) {
                try {
                    setTimeout(() => {
                        if (isListening && recognitionRef.current) {
                            recognitionRef.current.start();
                        }
                    }, 100);
                } catch { }
            }
        };

        recognition.onerror = () => { };

        recognitionRef.current = recognition;

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };
    }, [isListening, isLoading, isSpeaking, autoMode]);

    // Auto-start listening when doctor finishes speaking
    useEffect(() => {
        if (!isSpeaking && autoMode && !isLoading && messages.length > 0) {
            // Doctor finished speaking, auto-start listening
            setTimeout(() => startListening(), 500);
        }
    }, [isSpeaking, autoMode, isLoading]);

    const speak = useCallback((text: string) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        // Stop listening while speaking
        stopListening();

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ||
            voices.find(v => v.name.includes("Samantha")) ||
            voices.find(v => v.lang === "en-US");
        if (voice) utterance.voice = voice;
        utterance.rate = 0.95;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            // Auto-start after speaking ends (handled by useEffect above)
        };
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    }, []);

    const stopSpeaking = () => {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    };

    const startListening = () => {
        if (isLoading || isSpeaking) return;

        // Clear previous transcript
        setCurrentTranscript("");
        finalTranscriptRef.current = "";

        setIsListening(true);
        try {
            recognitionRef.current?.start();
        } catch { }
    };

    const stopListening = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        setIsListening(false);
        try {
            recognitionRef.current?.stop();
        } catch { }
    };

    const sendMessage = async (transcript: string) => {
        stopListening();

        if (!transcript.trim()) return;

        setMessages(prev => [...prev, { role: "user", content: transcript }]);
        setCurrentTranscript("");
        finalTranscriptRef.current = "";
        setIsLoading(true);
        setSuggestedDoctor(null);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: transcript, specialty }),
            });
            const data = await response.json();

            if (data.redirect && data.redirect !== specialty) {
                setSuggestedDoctor(data.redirect);
            }

            setMessages(prev => [...prev, { role: "assistant", content: data.message, redirect: data.redirect }]);
            speak(data.message);
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble understanding. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const goToSuggestedDoctor = () => {
        if (suggestedDoctor) {
            router.push(`/consultation?specialty=${suggestedDoctor}`);
            setSuggestedDoctor(null);
            setMessages([]);
        }
    };

    const generateReport = () => {
        stopSpeaking();
        stopListening();
        setAutoMode(false);

        const symptoms = messages.filter(m => m.role === "user").map(m => `• ${m.content}`).join("\n");
        const consultation = messages.filter(m => m.role === "assistant" && !m.redirect).slice(1).map(m => `• ${m.content}`).join("\n");

        setReport(`
══════════════════════════════════════════════════
              MEDICAL PRESCRIPTION
              Rwanda Digital Health
══════════════════════════════════════════════════

Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
Specialist: ${doc.title}

──────────────────────────────────────────────────
PATIENT SYMPTOMS:
──────────────────────────────────────────────────
${symptoms || "None recorded"}

──────────────────────────────────────────────────
CONSULTATION NOTES:
──────────────────────────────────────────────────
${consultation || "None recorded"}

──────────────────────────────────────────────────
PRESCRIBED MEDICINES:
──────────────────────────────────────────────────
${doc.medicines.map((m, i) => `${i + 1}. ${m}`).join("\n")}

──────────────────────────────────────────────────
INSTRUCTIONS:
──────────────────────────────────────────────────
• Take all medicines as prescribed
• Complete full course of treatment
• Return if symptoms persist
• Emergency: Call 912

══════════════════════════════════════════════════
`);
        setShowReport(true);
    };

    const downloadReport = () => {
        const blob = new Blob([report], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `prescription-${specialty}-${Date.now()}.txt`;
        a.click();
    };

    const resetConsultation = () => {
        setShowReport(false);
        setSuggestedDoctor(null);
        setAutoMode(true);
        const greeting = `Hello! I'm your ${doc.title}. What symptoms are you experiencing?`;
        setMessages([{ role: "assistant", content: greeting }]);
        setTimeout(() => speak(greeting), 300);
    };

    // Initial greeting
    useEffect(() => {
        const greeting = `Hello! I'm your ${doc.title}. What symptoms are you experiencing?`;
        setMessages([{ role: "assistant", content: greeting }]);
        setSuggestedDoctor(null);
        setAutoMode(true);
        setTimeout(() => speak(greeting), 500);
    }, [specialty]);

    if (showReport) {
        return (
            <div className="flex h-[calc(100vh-120px)] flex-col">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">📋 Your Prescription</h1>
                    <button onClick={() => setShowReport(false)} className="p-2 hover:bg-neutral-100 rounded-lg dark:hover:bg-neutral-800"><IconX className="h-5 w-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto rounded-2xl border bg-neutral-50 p-6 font-mono text-sm dark:bg-neutral-900 dark:border-neutral-800">
                    <pre className="whitespace-pre-wrap">{report}</pre>
                </div>
                <div className="mt-4 flex gap-3 flex-wrap">
                    <button onClick={downloadReport} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-green-500 px-6 py-3 text-white font-medium"><IconDownload className="h-5 w-5" /> Download</button>
                    <button onClick={resetConsultation} className="flex items-center gap-2 rounded-xl border px-6 py-3 dark:border-neutral-700"><IconCheck className="h-5 w-5" /> New Consultation</button>
                    <Link href="/dashboard" className="flex items-center gap-2 rounded-xl border px-6 py-3 dark:border-neutral-700"><IconArrowLeft className="h-5 w-5" /> Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-120px)] flex-col">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="p-2 hover:bg-neutral-100 rounded-lg dark:hover:bg-neutral-800"><IconArrowLeft className="h-5 w-5" /></Link>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${doc.color}`}><DocIcon className="h-6 w-6 text-white" /></div>
                    <div>
                        <h1 className="font-bold text-neutral-900 dark:text-white">{doc.title}</h1>
                        <p className="text-xs text-green-500">● Online • {autoMode ? "Auto-listening" : "Manual mode"}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isSpeaking && <button onClick={stopSpeaking} className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-sm text-red-600"><IconVolumeOff className="h-4 w-4" /> Stop</button>}
                    <button onClick={() => setAutoMode(!autoMode)} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm ${autoMode ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-600'}`}>
                        {autoMode ? <IconMicrophone className="h-4 w-4" /> : <IconMicrophoneOff className="h-4 w-4" />}
                        {autoMode ? "Auto" : "Manual"}
                    </button>
                    {messages.length > 1 && !suggestedDoctor && <button onClick={generateReport} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-white font-medium"><IconFileText className="h-5 w-5" /> Get Prescription</button>}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto rounded-2xl border bg-white p-4 dark:bg-neutral-900 dark:border-neutral-800">
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`flex max-w-[85%] gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-blue-500" : `bg-gradient-to-br ${doc.color}`}`}>
                                    {msg.role === "user" ? <IconUser className="h-4 w-4 text-white" /> : <DocIcon className="h-4 w-4 text-white" />}
                                </div>
                                <div className={`rounded-2xl px-4 py-2 ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-neutral-100 dark:bg-neutral-800"}`}>
                                    <p className="text-sm">{msg.content}</p>
                                    {msg.role === "assistant" && !msg.redirect && <button onClick={() => speak(msg.content)} className="mt-1 text-xs text-neutral-400 hover:text-blue-500 flex items-center gap-1"><IconVolume className="h-3 w-3" /> Replay</button>}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && <div className="flex gap-2 mb-4"><div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${doc.color}`}><DocIcon className="h-4 w-4 text-white" /></div><div className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-2 dark:bg-neutral-800"><IconLoader2 className="h-4 w-4 animate-spin" /> Thinking...</div></div>}

                {/* Live transcript */}
                {isListening && currentTranscript && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end mb-4">
                        <div className="rounded-2xl bg-blue-100 px-4 py-2 text-sm text-blue-700 dark:bg-blue-900/30">
                            {currentTranscript}
                            <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Doctor Button */}
            {suggestedDoctor && SPECIALISTS[suggestedDoctor] && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                    <button onClick={goToSuggestedDoctor} className={`w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r ${SPECIALISTS[suggestedDoctor].color} px-6 py-4 text-white font-medium shadow-lg`}>
                        {(() => { const Icon = SPECIALISTS[suggestedDoctor].icon; return <Icon className="h-6 w-6" />; })()}
                        Go to {SPECIALISTS[suggestedDoctor].title}
                        <IconArrowRight className="h-5 w-5" />
                    </button>
                </motion.div>
            )}

            {/* Status Bar */}
            <div className="mt-4 flex items-center justify-center gap-4">
                {!autoMode && (
                    <motion.button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isLoading || isSpeaking}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg disabled:opacity-50 ${isListening ? 'bg-red-500' : `bg-gradient-to-br ${doc.color}`} text-white`}
                    >
                        {isListening ? <IconMicrophoneOff className="h-6 w-6" /> : <IconMicrophone className="h-6 w-6" />}
                    </motion.button>
                )}

                <div className="flex items-center gap-2 text-sm text-neutral-500">
                    {isSpeaking && (
                        <motion.div className="flex items-center gap-2 text-green-600" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                            <div className="flex gap-1">
                                {[...Array(4)].map((_, i) => <motion.div key={i} className="h-3 w-1 rounded-full bg-green-500" animate={{ height: [12, 20, 12] }} transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }} />)}
                            </div>
                            Doctor speaking...
                        </motion.div>
                    )}
                    {isListening && !isSpeaking && (
                        <motion.div className="flex items-center gap-2 text-blue-600" animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <div className="flex gap-1">
                                {[...Array(4)].map((_, i) => <motion.div key={i} className="h-3 w-1 rounded-full bg-blue-500" animate={{ height: [8, 16, 8] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }} />)}
                            </div>
                            Listening... speak naturally
                        </motion.div>
                    )}
                    {!isListening && !isSpeaking && !isLoading && autoMode && (
                        <span className="text-neutral-400">Waiting for doctor to respond...</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// Default export with Suspense boundary
export default function ConsultationPage() {
    return (
        <Suspense fallback={<ConsultationLoading />}>
            <ConsultationContent />
        </Suspense>
    );
}
