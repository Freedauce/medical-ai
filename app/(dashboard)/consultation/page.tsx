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
    IconLungs,
    IconApple,
    IconArrowRight,
    IconSend,
    IconKeyboard
} from "@tabler/icons-react";
import Link from "next/link";
import { jsPDF } from "jspdf";

interface Message {
    role: "user" | "assistant";
    content: string;
    redirect?: string;
    referral?: { recommended: string; title: string };
}

interface Referral {
    from: string;
    to: string;
    toTitle: string;
    reason: string;
}

const SPECIALISTS: Record<string, { title: string; icon: React.ElementType; color: string; medicines: string[] }> = {
    general: { title: "General Doctor", icon: IconHeart, color: "from-red-500 to-pink-500", medicines: ["Paracetamol 500mg - Take 1 tablet every 6 hours", "Ibuprofen 400mg - Take 1 twice daily with food", "Vitamin C 1000mg - Take 1 daily"] },
    eye: { title: "Eye Doctor", icon: IconEye, color: "from-blue-500 to-cyan-500", medicines: ["Artificial Tears - Apply 1-2 drops 4 times daily", "Tobramycin drops - 1 drop 3 times daily for 7 days"] },
    orthopedic: { title: "Bone Doctor", icon: IconBone, color: "from-orange-500 to-amber-500", medicines: ["Diclofenac 50mg - 1 tablet twice daily", "Calcium + Vitamin D - 1 tablet daily", "Ice pack 15 mins, 3 times daily"] },
    respiratory: { title: "Lung Doctor", icon: IconLungs, color: "from-teal-500 to-emerald-500", medicines: ["Salbutamol inhaler - 2 puffs when needed", "Amoxicillin 500mg - 1 tablet 3 times daily"] },
    digestive: { title: "Stomach Doctor", icon: IconApple, color: "from-yellow-500 to-lime-500", medicines: ["Omeprazole 20mg - 1 before breakfast", "Loperamide 2mg - 2 initially, 1 after each loose stool"] },
};

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
    const [textInput, setTextInput] = useState("");
    const [showTextInput, setShowTextInput] = useState(true);
    const [referrals, setReferrals] = useState<Referral[]>([]);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isListeningRef = useRef(false);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    // Keep ref in sync with state
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    // Initialize speech recognition ONCE
    useEffect(() => {
        if (typeof window === "undefined") return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }

            if (transcript.trim()) {
                setCurrentTranscript(transcript);

                // Reset silence timer
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

                // Check if we have a final result
                const lastResult = event.results[event.results.length - 1];
                if (lastResult.isFinal) {
                    // Send after 1 second of silence after final result
                    silenceTimerRef.current = setTimeout(() => {
                        if (isListeningRef.current && transcript.trim()) {
                            handleSendMessage(transcript.trim());
                        }
                    }, 1000);
                }
            }
        };

        recognition.onend = () => {
            // Auto-restart if still should be listening
            if (isListeningRef.current) {
                setTimeout(() => {
                    try {
                        recognition.start();
                    } catch { }
                }, 100);
            }
        };

        recognition.onerror = (event) => {
            console.log("Speech error:", event.error);
            if (event.error === "not-allowed") {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            try { recognition.stop(); } catch { }
        };
    }, []);

    const speak = useCallback((text: string, onComplete?: () => void) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
            onComplete?.();
            return;
        }

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
            onComplete?.();
            // No auto-listening - user must click mic button
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            onComplete?.();
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const stopSpeaking = () => {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    };

    const startListening = useCallback(() => {
        if (isLoading || isSpeaking) return;

        setCurrentTranscript("");
        setIsListening(true);

        try {
            recognitionRef.current?.start();
        } catch { }
    }, [isLoading, isSpeaking]);

    const stopListening = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        setIsListening(false);
        setCurrentTranscript("");

        try {
            recognitionRef.current?.stop();
        } catch { }
    }, []);

    const handleSendMessage = async (text: string) => {
        const trimmedText = text.trim();
        if (!trimmedText || isLoading) return;

        stopListening();
        setCurrentTranscript("");
        setTextInput("");

        setMessages(prev => [...prev, { role: "user", content: trimmedText }]);
        setIsLoading(true);
        setSuggestedDoctor(null);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmedText, specialty }),
            });
            const data = await response.json();

            // Track referral if suggested
            if (data.referral) {
                setSuggestedDoctor(data.referral.recommended);
                setReferrals(prev => [
                    ...prev,
                    {
                        from: doc.title,
                        to: data.referral.recommended,
                        toTitle: data.referral.title,
                        reason: trimmedText
                    }
                ]);
            }

            setMessages(prev => [...prev, {
                role: "assistant",
                content: data.message,
                redirect: data.redirect,
                referral: data.referral
            }]);
            speak(data.message);
        } catch {
            const errorMsg = "Sorry, I had trouble understanding. Please try again.";
            setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
            speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim()) {
            handleSendMessage(textInput);
        }
    };

    const goToSuggestedDoctor = () => {
        if (suggestedDoctor) {
            stopListening();
            stopSpeaking();
            router.push(`/consultation?specialty=${suggestedDoctor}`);
            setSuggestedDoctor(null);
            setMessages([]);
        }
    };

    const generateReport = () => {
        stopSpeaking();
        stopListening();

        const symptoms = messages.filter(m => m.role === "user").map(m => `• ${m.content}`).join("\n");
        const consultation = messages.filter(m => m.role === "assistant" && !m.redirect).slice(1).map(m => `• ${m.content}`).join("\n");
        const referralsList = referrals.length > 0
            ? `\n──────────────────────────────────────────────────\n🔄 SPECIALIST REFERRALS:\n──────────────────────────────────────────────────\n${referrals.map((r, i) => `${i + 1}. Referred from ${r.from} to ${r.toTitle}\n   Reason: ${r.reason}`).join("\n")}\n`
            : "";

        setReport(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║           🏥 KIGALI AI MEDICAL                   ║
║         AI-Powered Health Consultation           ║
║                                                  ║
╚══════════════════════════════════════════════════╝

📋 MEDICAL PRESCRIPTION REPORT
──────────────────────────────────────────────────

📅 Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
🕐 Time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
👨‍⚕️ Specialist: ${doc.title}

──────────────────────────────────────────────────
🩺 PATIENT SYMPTOMS:
──────────────────────────────────────────────────
${symptoms || "None recorded"}

──────────────────────────────────────────────────
📝 CONSULTATION NOTES:
──────────────────────────────────────────────────
${consultation || "None recorded"}

──────────────────────────────────────────────────
💊 PRESCRIBED MEDICINES:
──────────────────────────────────────────────────
${doc.medicines.map((m, i) => `${i + 1}. ${m}`).join("\n")}

──────────────────────────────────────────────────
📌 INSTRUCTIONS:
──────────────────────────────────────────────────
• Take all medicines as prescribed
• Complete full course of treatment
• Return if symptoms persist after 7 days
• Keep hydrated and get adequate rest
• Emergency Contact: Call 912 (Rwanda)
${referralsList}
══════════════════════════════════════════════════
⚠️ DISCLAIMER: This is an AI-generated consultation.
Please visit a licensed healthcare provider for
final diagnosis and treatment.
══════════════════════════════════════════════════

🌐 Kigali AI Medical - www.kigali-ai-medical.rw
📧 support@kigali-ai-medical.rw
📞 +250 788 000 000

© ${new Date().getFullYear()} Kigali AI Medical. All rights reserved.
`);
        setShowReport(true);
    };

    const downloadReport = () => {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;

        // Header - Kigali AI Medical
        pdf.setFillColor(37, 99, 235);
        pdf.rect(0, 0, pageWidth, 45, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('KIGALI AI MEDICAL', pageWidth / 2, 20, { align: 'center' });

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('AI-Powered Health Consultation', pageWidth / 2, 32, { align: 'center' });

        y = 55;

        // Reset text color
        pdf.setTextColor(0, 0, 0);

        // Title
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MEDICAL PRESCRIPTION REPORT', pageWidth / 2, y, { align: 'center' });
        y += 15;

        // Line
        pdf.setDrawColor(37, 99, 235);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y);
        y += 10;

        // Details
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        pdf.text(`Date: ${date}`, margin, y);
        y += 7;
        pdf.text(`Time: ${time}`, margin, y);
        y += 7;
        pdf.text(`Specialist: ${doc.title}`, margin, y);
        y += 15;

        // Symptoms Section
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, y - 5, pageWidth - 2 * margin, 10, 'F');
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PATIENT SYMPTOMS', margin + 5, y + 2);
        y += 15;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const symptoms = messages.filter(m => m.role === 'user').map(m => m.content);
        symptoms.forEach(symptom => {
            const lines = pdf.splitTextToSize(`• ${symptom}`, pageWidth - 2 * margin - 10);
            lines.forEach((line: string) => {
                if (y > 270) { pdf.addPage(); y = 20; }
                pdf.text(line, margin + 5, y);
                y += 6;
            });
        });
        y += 10;

        // Consultation Notes Section
        if (y > 250) { pdf.addPage(); y = 20; }
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, y - 5, pageWidth - 2 * margin, 10, 'F');
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CONSULTATION NOTES', margin + 5, y + 2);
        y += 15;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const notes = messages.filter(m => m.role === 'assistant' && !m.redirect).slice(1).map(m => m.content);
        notes.forEach(note => {
            const lines = pdf.splitTextToSize(`• ${note}`, pageWidth - 2 * margin - 10);
            lines.forEach((line: string) => {
                if (y > 270) { pdf.addPage(); y = 20; }
                pdf.text(line, margin + 5, y);
                y += 6;
            });
        });
        y += 10;

        // Prescribed Medicines Section
        if (y > 230) { pdf.addPage(); y = 20; }
        pdf.setFillColor(37, 99, 235);
        pdf.rect(margin, y - 5, pageWidth - 2 * margin, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PRESCRIBED MEDICINES', margin + 5, y + 2);
        y += 15;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        doc.medicines.forEach((med, i) => {
            if (y > 270) { pdf.addPage(); y = 20; }
            pdf.text(`${i + 1}. ${med}`, margin + 5, y);
            y += 7;
        });
        y += 10;

        // Instructions Section
        if (y > 230) { pdf.addPage(); y = 20; }
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, y - 5, pageWidth - 2 * margin, 10, 'F');
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INSTRUCTIONS', margin + 5, y + 2);
        y += 15;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const instructions = [
            'Take all medicines as prescribed',
            'Complete full course of treatment',
            'Return if symptoms persist after 7 days',
            'Keep hydrated and get adequate rest',
            'Emergency Contact: Call 912 (Rwanda)'
        ];
        instructions.forEach(inst => {
            pdf.text(`• ${inst}`, margin + 5, y);
            y += 7;
        });
        y += 10;

        // Referrals Section (if any)
        if (referrals.length > 0) {
            if (y > 220) { pdf.addPage(); y = 20; }
            pdf.setFillColor(147, 51, 234); // Purple color for referrals
            pdf.rect(margin, y - 5, pageWidth - 2 * margin, 10, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SPECIALIST REFERRALS', margin + 5, y + 2);
            y += 15;

            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            referrals.forEach((ref, i) => {
                if (y > 265) { pdf.addPage(); y = 20; }
                pdf.text(`${i + 1}. Referred from ${ref.from} to ${ref.toTitle}`, margin + 5, y);
                y += 6;
                const reasonLines = pdf.splitTextToSize(`   Reason: ${ref.reason}`, pageWidth - 2 * margin - 15);
                reasonLines.forEach((line: string) => {
                    pdf.text(line, margin + 5, y);
                    y += 5;
                });
                y += 3;
            });
            y += 5;
        }

        // Disclaimer
        if (y > 250) { pdf.addPage(); y = 20; }
        pdf.setFillColor(255, 243, 205);
        pdf.rect(margin, y - 5, pageWidth - 2 * margin, 25, 'F');
        pdf.setFontSize(9);
        pdf.setTextColor(133, 100, 4);
        pdf.text('DISCLAIMER: This is an AI-generated consultation.', margin + 5, y + 3);
        pdf.text('Please visit a licensed healthcare provider for final diagnosis and treatment.', margin + 5, y + 11);
        y += 30;

        // Footer
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(9);
        pdf.text('Kigali AI Medical | www.kigali-ai-medical.rw | support@kigali-ai-medical.rw', pageWidth / 2, 285, { align: 'center' });
        pdf.text(`© ${new Date().getFullYear()} Kigali AI Medical. All rights reserved.`, pageWidth / 2, 292, { align: 'center' });

        // Save the PDF
        pdf.save(`Kigali-AI-Prescription-${Date.now()}.pdf`);
    };

    const resetConsultation = () => {
        setShowReport(false);
        setSuggestedDoctor(null);
        const greeting = `Hello! I'm your ${doc.title}. What symptoms are you experiencing?`;
        setMessages([{ role: "assistant", content: greeting }]);
        setTimeout(() => speak(greeting), 300);
    };

    // Initial greeting
    useEffect(() => {
        const greeting = `Hello! I'm your ${doc.title}. What symptoms are you experiencing?`;
        setMessages([{ role: "assistant", content: greeting }]);
        setSuggestedDoctor(null);
        setTimeout(() => speak(greeting), 500);

        return () => {
            stopListening();
            stopSpeaking();
        };
    }, [specialty]);

    if (showReport) {
        return (
            <div className="flex h-[calc(100vh-120px)] flex-col">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl font-bold">📋 Your Prescription</h1>
                    <button onClick={() => setShowReport(false)} className="p-2 hover:bg-neutral-100 rounded-lg dark:hover:bg-neutral-800"><IconX className="h-5 w-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto rounded-2xl border bg-neutral-50 p-4 sm:p-6 font-mono text-xs sm:text-sm dark:bg-neutral-900 dark:border-neutral-800">
                    <pre className="whitespace-pre-wrap">{report}</pre>
                </div>
                <div className="mt-4 flex gap-2 sm:gap-3 flex-wrap">
                    <button onClick={downloadReport} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-green-500 px-4 sm:px-6 py-2 sm:py-3 text-white font-medium text-sm"><IconDownload className="h-4 w-4 sm:h-5 sm:w-5" /> Download</button>
                    <button onClick={resetConsultation} className="flex items-center gap-2 rounded-xl border px-4 sm:px-6 py-2 sm:py-3 dark:border-neutral-700 text-sm"><IconCheck className="h-4 w-4 sm:h-5 sm:w-5" /> New</button>
                    <Link href="/dashboard" className="flex items-center gap-2 rounded-xl border px-4 sm:px-6 py-2 sm:py-3 dark:border-neutral-700 text-sm"><IconArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" /> Back</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-120px)] flex-col">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link href="/dashboard" className="p-2 hover:bg-neutral-100 rounded-lg dark:hover:bg-neutral-800"><IconArrowLeft className="h-5 w-5" /></Link>
                    <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br ${doc.color}`}><DocIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" /></div>
                    <div>
                        <h1 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">{doc.title}</h1>
                        <p className="text-xs text-green-500">● Online</p>
                    </div>
                </div>
                <div className="flex gap-1 sm:gap-2">
                    {isSpeaking && <button onClick={stopSpeaking} className="flex items-center gap-1 rounded-lg bg-red-100 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-red-600"><IconVolumeOff className="h-4 w-4" /><span className="hidden sm:inline">Stop</span></button>}
                    {messages.length > 1 && !suggestedDoctor && <button onClick={generateReport} className="flex items-center gap-1 sm:gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-3 sm:px-4 py-1.5 sm:py-2 text-white font-medium text-xs sm:text-sm"><IconFileText className="h-4 w-4 sm:h-5 sm:w-5" /><span className="hidden sm:inline">Prescription</span></button>}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto rounded-2xl border bg-white p-3 sm:p-4 dark:bg-neutral-900 dark:border-neutral-800">
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mb-3 sm:mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`flex max-w-[90%] sm:max-w-[85%] gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-blue-500" : `bg-gradient-to-br ${doc.color}`}`}>
                                    {msg.role === "user" ? <IconUser className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" /> : <DocIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />}
                                </div>
                                <div className={`rounded-2xl px-3 sm:px-4 py-2 ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-neutral-100 dark:bg-neutral-800"}`}>
                                    <p className="text-xs sm:text-sm">{msg.content}</p>
                                    {msg.role === "assistant" && !msg.redirect && <button onClick={() => speak(msg.content)} className="mt-1 text-xs text-neutral-400 hover:text-blue-500 flex items-center gap-1"><IconVolume className="h-3 w-3" /> Replay</button>}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <div className="flex gap-2 mb-3">
                        <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br ${doc.color}`}><DocIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" /></div>
                        <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-3 sm:px-4 py-2 dark:bg-neutral-800"><IconLoader2 className="h-4 w-4 animate-spin" /> <span className="text-xs sm:text-sm">Thinking...</span></div>
                    </div>
                )}

                {/* Live transcript */}
                {isListening && currentTranscript && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end mb-3">
                        <div className="rounded-2xl bg-blue-100 px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-700 dark:bg-blue-900/30 max-w-[90%]">
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
                    <button onClick={goToSuggestedDoctor} className={`w-full flex items-center justify-center gap-2 sm:gap-3 rounded-xl bg-gradient-to-r ${SPECIALISTS[suggestedDoctor].color} px-4 sm:px-6 py-3 sm:py-4 text-white font-medium shadow-lg text-sm sm:text-base`}>
                        {(() => { const Icon = SPECIALISTS[suggestedDoctor].icon; return <Icon className="h-5 w-5 sm:h-6 sm:w-6" />; })()}
                        Go to {SPECIALISTS[suggestedDoctor].title}
                        <IconArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </motion.div>
            )}

            {/* Input Area */}
            <div className="mt-3 space-y-2">
                {/* Text Input (toggleable) */}
                {showTextInput && (
                    <form onSubmit={handleTextSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !textInput.trim()}
                            className={`flex items-center justify-center rounded-xl px-4 py-3 text-white bg-gradient-to-r ${doc.color} disabled:opacity-50`}
                        >
                            <IconSend className="h-5 w-5" />
                        </button>
                    </form>
                )}

                {/* Control buttons */}
                <div className="flex items-center justify-center gap-3">
                    {/* Toggle text input */}
                    <button
                        onClick={() => setShowTextInput(!showTextInput)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${showTextInput ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}
                    >
                        <IconKeyboard className="h-5 w-5" />
                        <span className="hidden sm:inline">Type</span>
                    </button>

                    {/* Microphone button */}
                    <motion.button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isLoading || isSpeaking}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full shadow-lg disabled:opacity-50 transition-all ${isListening ? 'bg-red-500 animate-pulse' : `bg-gradient-to-br ${doc.color}`} text-white`}
                    >
                        {isListening ? <IconMicrophoneOff className="h-6 w-6 sm:h-7 sm:w-7" /> : <IconMicrophone className="h-6 w-6 sm:h-7 sm:w-7" />}
                    </motion.button>

                    {/* Status indicator */}
                    <div className="w-20 sm:w-24 text-center">
                        {isSpeaking && <span className="text-xs sm:text-sm text-green-600">🔊 Speaking</span>}
                        {isListening && !isSpeaking && <span className="text-xs sm:text-sm text-blue-600">🎤 Listening</span>}
                        {isLoading && <span className="text-xs sm:text-sm text-neutral-500">⏳ Thinking</span>}
                        {!isSpeaking && !isListening && !isLoading && <span className="text-xs sm:text-sm text-neutral-400">Tap mic</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ConsultationPage() {
    return (
        <Suspense fallback={<ConsultationLoading />}>
            <ConsultationContent />
        </Suspense>
    );
}
