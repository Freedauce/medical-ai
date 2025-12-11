"use client";

import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { IconUser, IconMail, IconCalendar, IconCoin } from "@tabler/icons-react";

export default function ProfilePage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                    Your Profile
                </h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Manage your account settings
                </p>
            </motion.div>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500" />

                {/* Profile Content */}
                <div className="relative px-6 pb-6">
                    {/* Avatar */}
                    <div className="-mt-16 mb-4">
                        <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-green-500 shadow-lg dark:border-neutral-900">
                            {session?.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <IconUser className="h-16 w-16 text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {session?.user?.name || "User"}
                            </h2>
                            <p className="text-neutral-500">Kigali AI Medical Member</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-3 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
                                <IconMail className="h-5 w-5 text-neutral-500" />
                                <div>
                                    <p className="text-xs text-neutral-500">Email</p>
                                    <p className="font-medium text-neutral-900 dark:text-white">
                                        {session?.user?.email || "Not set"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
                                <IconCalendar className="h-5 w-5 text-neutral-500" />
                                <div>
                                    <p className="text-xs text-neutral-500">Account Type</p>
                                    <p className="font-medium text-neutral-900 dark:text-white">
                                        Google Account
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-green-500/10 p-4">
                                <IconCoin className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-xs text-neutral-500">Credits</p>
                                    <p className="font-medium text-neutral-900 dark:text-white">
                                        Unlimited (Free Plan)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tips Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
            >
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    Getting the Most from Kigali AI
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        Speak clearly and describe your symptoms in detail
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                        Mention how long you&apos;ve been experiencing symptoms
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                        Always follow up with a healthcare professional for serious concerns
                    </li>
                </ul>
            </motion.div>
        </div>
    );
}
