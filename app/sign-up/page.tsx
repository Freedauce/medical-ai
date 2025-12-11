"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "motion/react";
import { IconBrandGoogle, IconStethoscope, IconMail, IconLock, IconUser, IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Registration failed");
                return;
            }

            setSuccess(true);
            // Auto sign in after registration
            setTimeout(() => {
                signIn("credentials", { email, password, callbackUrl: "/dashboard" });
            }, 1500);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
            >
                {/* Logo */}
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500">
                            <IconStethoscope className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Kigali AI Medical
                        </span>
                    </Link>
                </div>

                {/* Welcome Text */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        Create Your Account
                    </h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        Join Kigali AI Medical for free health guidance
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-600 dark:bg-green-950 dark:text-green-400">
                        Account created! Signing you in...
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                        {error}
                    </div>
                )}

                {!success && (
                    <>
                        {/* Google Sign Up Button */}
                        <button
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white px-6 py-3 font-medium text-neutral-700 transition-all hover:bg-neutral-50 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                        >
                            <IconBrandGoogle className="h-5 w-5" />
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-4 text-neutral-500 dark:bg-neutral-900">
                                    or sign up with email
                                </span>
                            </div>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <IconUser className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full rounded-lg border border-neutral-300 bg-white py-3 pl-10 pr-4 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Email
                                </label>
                                <div className="relative">
                                    <IconMail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full rounded-lg border border-neutral-300 bg-white py-3 pl-10 pr-4 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Password
                                </label>
                                <div className="relative">
                                    <IconLock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="w-full rounded-lg border border-neutral-300 bg-white py-3 pl-10 pr-4 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-green-500 py-3 font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <IconLoader2 className="h-5 w-5 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </form>
                    </>
                )}

                {/* Sign In Link */}
                <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                        Sign in
                    </Link>
                </p>

                {/* Back to Home */}
                <div className="text-center">
                    <Link
                        href="/"
                        className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
