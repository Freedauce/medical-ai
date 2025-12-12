"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    IconMicrophone,
    IconHistory,
    IconHeart,
    IconEye,
    IconBone,
    IconLungs,
    IconApple,
    IconShieldCheck
} from "@tabler/icons-react";

const specialties = [
    {
        id: "general",
        name: "General Health",
        icon: IconHeart,
        color: "from-red-500 to-pink-500",
        description: "Heart, blood pressure, general wellness",
    },
    {
        id: "eye",
        name: "Eye Care",
        icon: IconEye,
        color: "from-blue-500 to-cyan-500",
        description: "Vision, eye infections, eye health",
    },
    {
        id: "orthopedic",
        name: "Orthopedics",
        icon: IconBone,
        color: "from-orange-500 to-amber-500",
        description: "Bones, joints, muscles, back pain",
    },
    {
        id: "respiratory",
        name: "Respiratory",
        icon: IconLungs,
        color: "from-teal-500 to-emerald-500",
        description: "Breathing, cough, chest issues",
    },
    {
        id: "digestive",
        name: "Digestive",
        icon: IconApple,
        color: "from-yellow-500 to-lime-500",
        description: "Stomach, digestion, appetite",
    },
];

export default function DashboardPage() {
    const { data: session } = useSession();

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                    Muraho, {session?.user?.name?.split(" ")[0] || "Friend"}! 👋
                </h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Welcome to Kigali AI Medical. Choose a specialty or start a voice consultation.
                </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid gap-6 md:grid-cols-2"
            >
                {/* Start Consultation Card */}
                <Link href="/consultation" className="group">
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-blue-500 to-green-500 p-6 transition-all hover:scale-[1.02] hover:shadow-xl dark:border-neutral-800">
                        <div className="relative z-10">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                <IconMicrophone className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Voice Consultation</h3>
                            <p className="mt-2 text-white/80">
                                Speak your symptoms and get AI-powered voice responses
                            </p>
                            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white">
                                🎙️ Start Speaking Now
                            </div>
                        </div>
                        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
                        <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/10" />
                    </div>
                </Link>

                {/* View History Card */}
                <Link href="/history" className="group">
                    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:scale-[1.02] hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500">
                            <IconHistory className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Consultation History
                        </h3>
                        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                            View past consultations, reports and AI recommendations
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            📋 View Reports
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Medical Specialties */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
                    Choose a Medical Specialty
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {specialties.map((specialty, index) => {
                        const Icon = specialty.icon;
                        return (
                            <motion.div
                                key={specialty.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 * index }}
                            >
                                <Link
                                    href={`/consultation?specialty=${specialty.id}`}
                                    className="group block"
                                >
                                    <div className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
                                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${specialty.color}`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="mt-3 font-semibold text-neutral-900 dark:text-white">
                                            {specialty.name}
                                        </h3>
                                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                            {specialty.description}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-blue-50 to-green-50 p-6 dark:border-neutral-800 dark:from-blue-950/30 dark:to-green-950/30"
            >
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <IconShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            How It Works
                        </h3>
                        <ul className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                            <li>🎙️ <strong>Speak</strong> - Describe your symptoms using your voice</li>
                            <li>🤖 <strong>Listen</strong> - AI responds with voice guidance</li>
                            <li>📋 <strong>Review</strong> - Get a detailed health report</li>
                            <li>🏥 <strong>Follow Up</strong> - Visit Rwanda hospitals if needed</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
