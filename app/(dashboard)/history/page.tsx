"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    IconHistory,
    IconLoader2,
    IconChevronDown,
    IconChevronUp,
    IconVolume,
    IconVolumeOff,
    IconCalendar,
    IconUser,
    IconStethoscope,
    IconFileText
} from "@tabler/icons-react";

interface Consultation {
    id: number;
    transcript: string;
    aiResponse: string;
    createdAt: string;
}

export default function HistoryPage() {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [speakingId, setSpeakingId] = useState<number | null>(null);

    useEffect(() => {
        fetchConsultations();
    }, []);

    const fetchConsultations = async () => {
        try {
            const response = await fetch("/api/consultations");
            const data = await response.json();
            if (response.ok) {
                setConsultations(data.consultations);
            }
        } catch (error) {
            console.error("Error fetching consultations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getRelativeTime = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return formatDate(dateString);
    };

    const truncateText = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const speakText = useCallback((text: string, id: number) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (englishVoice) utterance.voice = englishVoice;

        utterance.onstart = () => setSpeakingId(id);
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);

        window.speechSynthesis.speak(utterance);
    }, []);

    const stopSpeaking = () => {
        if (typeof window !== "undefined") {
            window.speechSynthesis.cancel();
            setSpeakingId(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                        Consultation History
                    </h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        Your health consultation reports and AI recommendations
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 dark:bg-blue-900/30">
                    <IconFileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                        {consultations.length} Reports
                    </span>
                </div>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <IconLoader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && consultations.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-2xl border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <IconHistory className="h-10 w-10 text-neutral-400" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white">
                        No consultations yet
                    </h3>
                    <p className="mt-2 text-neutral-500">
                        Start your first voice consultation to see your health reports here
                    </p>
                    <a
                        href="/consultation"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-green-500 px-6 py-3 font-medium text-white transition-all hover:opacity-90"
                    >
                        Start Consultation
                    </a>
                </motion.div>
            )}

            {/* Consultations List */}
            <div className="space-y-4">
                {consultations.map((consultation, index) => (
                    <motion.div
                        key={consultation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                    >
                        {/* Card Header */}
                        <button
                            onClick={() =>
                                setExpandedId(expandedId === consultation.id ? null : consultation.id)
                            }
                            className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-green-500">
                                    <IconStethoscope className="h-6 w-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                            {getRelativeTime(consultation.createdAt)}
                                        </span>
                                    </div>
                                    <p className="mt-1 font-medium text-neutral-900 dark:text-white">
                                        {truncateText(consultation.transcript)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {expandedId === consultation.id ? (
                                    <IconChevronUp className="h-5 w-5 text-neutral-500" />
                                ) : (
                                    <IconChevronDown className="h-5 w-5 text-neutral-500" />
                                )}
                            </div>
                        </button>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {expandedId === consultation.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-neutral-200 dark:border-neutral-800"
                                >
                                    <div className="space-y-6 p-5">
                                        {/* Patient Query Section */}
                                        <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                            <div className="mb-2 flex items-center gap-2">
                                                <IconUser className="h-4 w-4 text-neutral-500" />
                                                <span className="text-sm font-medium text-neutral-500">
                                                    Your Symptoms
                                                </span>
                                            </div>
                                            <p className="text-neutral-900 dark:text-white">
                                                {consultation.transcript}
                                            </p>
                                        </div>

                                        {/* AI Response Section */}
                                        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-green-50 p-4 dark:from-blue-950/30 dark:to-green-950/30">
                                            <div className="mb-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <IconStethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                        AI Medical Advice
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (speakingId === consultation.id) {
                                                            stopSpeaking();
                                                        } else {
                                                            speakText(consultation.aiResponse, consultation.id);
                                                        }
                                                    }}
                                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${speakingId === consultation.id
                                                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                                        }`}
                                                >
                                                    {speakingId === consultation.id ? (
                                                        <>
                                                            <IconVolumeOff className="h-4 w-4" />
                                                            Stop
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconVolume className="h-4 w-4" />
                                                            Play
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                                                {consultation.aiResponse}
                                            </p>
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                                            <div className="flex items-center gap-1">
                                                <IconCalendar className="h-4 w-4" />
                                                {formatDate(consultation.createdAt)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <IconFileText className="h-4 w-4" />
                                                Report #{consultation.id}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
