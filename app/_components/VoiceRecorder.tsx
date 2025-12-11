"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { IconMicrophone, IconPlayerStop } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
    onTranscriptChange: (transcript: string) => void;
    onRecordingStateChange: (isRecording: boolean) => void;
    disabled?: boolean;
}

export function VoiceRecorder({
    onTranscriptChange,
    onRecordingStateChange,
    disabled = false
}: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const transcriptRef = useRef<string>("");
    const isRecordingRef = useRef<boolean>(false);

    useEffect(() => {
        // Check if Web Speech API is supported
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                setIsSupported(false);
                return;
            }

            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = "en-US";

            recognitionInstance.onresult = (event) => {
                let fullTranscript = "";

                // Rebuild full transcript from all results
                for (let i = 0; i < event.results.length; i++) {
                    const result = event.results[i];
                    fullTranscript += result[0].transcript;
                    // Add space after final results
                    if (result.isFinal) {
                        fullTranscript += " ";
                    }
                }

                transcriptRef.current = fullTranscript;
                onTranscriptChange(fullTranscript.trim());
            };

            recognitionInstance.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === "not-allowed") {
                    setIsSupported(false);
                }
                // Don't stop on minor errors, just log them
                if (event.error === "no-speech" || event.error === "audio-capture") {
                    // These are recoverable errors, the onend handler will restart
                    console.log("Recoverable error, will auto-restart");
                }
            };

            recognitionInstance.onend = () => {
                // Auto-restart if still supposed to be recording
                if (isRecordingRef.current) {
                    try {
                        setTimeout(() => {
                            if (isRecordingRef.current && recognitionRef.current) {
                                recognitionRef.current.start();
                            }
                        }, 100);
                    } catch (error) {
                        console.error("Error restarting recognition:", error);
                    }
                }
            };

            recognitionRef.current = recognitionInstance;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onTranscriptChange]);

    const startRecording = useCallback(() => {
        if (recognitionRef.current && !isRecordingRef.current) {
            transcriptRef.current = "";
            onTranscriptChange("");

            try {
                recognitionRef.current.start();
                isRecordingRef.current = true;
                setIsRecording(true);
                onRecordingStateChange(true);
            } catch (error) {
                console.error("Error starting recognition:", error);
            }
        }
    }, [onTranscriptChange, onRecordingStateChange]);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current && isRecordingRef.current) {
            isRecordingRef.current = false;
            setIsRecording(false);
            recognitionRef.current.stop();
            onRecordingStateChange(false);

            // Final transcript update
            if (transcriptRef.current.trim()) {
                onTranscriptChange(transcriptRef.current.trim());
            }
        }
    }, [onRecordingStateChange, onTranscriptChange]);

    if (!isSupported) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900 dark:bg-red-950">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Speech recognition is not supported in your browser.
                    Please use Chrome, Edge, or Safari for voice features.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center space-y-6">
            {/* Recording Button */}
            <motion.button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled}
                whileHover={{ scale: disabled ? 1 : 1.05 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
                className={cn(
                    "relative flex h-32 w-32 items-center justify-center rounded-full transition-all",
                    isRecording
                        ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30"
                        : "bg-gradient-to-br from-blue-500 to-green-500 shadow-lg shadow-blue-500/30",
                    disabled && "cursor-not-allowed opacity-50"
                )}
            >
                {/* Pulse Animation when recording */}
                {isRecording && (
                    <>
                        <motion.div
                            className="absolute inset-0 rounded-full bg-red-500"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full bg-red-500"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        />
                    </>
                )}

                {isRecording ? (
                    <IconPlayerStop className="relative z-10 h-12 w-12 text-white" />
                ) : (
                    <IconMicrophone className="relative z-10 h-12 w-12 text-white" />
                )}
            </motion.button>

            {/* Status Text */}
            <div className="text-center">
                <p className="text-lg font-medium text-neutral-900 dark:text-white">
                    {isRecording ? "🔴 Recording..." : "Tap to Start Speaking"}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                    {isRecording
                        ? "Speak clearly - everything you say is being captured"
                        : "Click the microphone and describe your symptoms"}
                </p>
            </div>

            {/* Audio Visualization */}
            {isRecording && (
                <motion.div
                    className="flex items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {[...Array(7)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 rounded-full bg-gradient-to-t from-red-500 to-orange-500"
                            animate={{
                                height: [12, 24 + Math.random() * 20, 12],
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                delay: i * 0.1,
                            }}
                        />
                    ))}
                </motion.div>
            )}

            {/* Recording indicator */}
            {isRecording && (
                <motion.div
                    className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    Live - speak naturally, take your time
                </motion.div>
            )}
        </div>
    );
}
