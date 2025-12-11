"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { IconStethoscope, IconMicrophone, IconBrain, IconShieldCheck, IconArrowRight } from "@tabler/icons-react";

export default function Home() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-neutral-200/50 bg-white/80 backdrop-blur-xl dark:border-neutral-800/50 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500">
              <IconStethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              Kigali AI Medical
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-green-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                >
                  Sign Out
                </button>
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-9 w-9 rounded-full"
                  />
                )}
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-green-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-32 pb-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-green-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-yellow-500/20 to-green-500/20 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            Powered by AI • Made for Rwanda
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl dark:text-white">
            Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-green-500 to-yellow-500 bg-clip-text text-transparent">
              AI Medical Assistant
            </span>{" "}
            in Kigali
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            Get instant, AI-powered health guidance through natural voice conversations.
            Describe your symptoms in English and receive helpful medical information
            tailored for Rwandan healthcare needs.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {session ? (
              <Link
                href="/consultation"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-green-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                Start Consultation
                <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-green-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                Start Free Consultation
                <IconArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <a
              href="#features"
              className="rounded-xl border border-neutral-300 px-8 py-4 text-lg font-semibold text-neutral-700 transition-all hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20"
        >
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-blue-500/5 to-green-500/5 p-4 shadow-2xl dark:border-neutral-800">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 text-sm text-neutral-500">Kigali AI Medical - Voice Consultation</span>
              </div>
              <div className="flex flex-col items-center justify-center p-12">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-500 shadow-lg shadow-blue-500/30">
                  <IconMicrophone className="h-12 w-12 text-white" />
                </div>
                <p className="mt-6 text-lg font-medium text-neutral-900 dark:text-white">
                  &quot;Describe your symptoms...&quot;
                </p>
                <p className="mt-2 text-neutral-500">
                  Click to start voice consultation
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-neutral-200 bg-neutral-50 py-24 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white">
              Healthcare Made Simple
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-600 dark:text-neutral-400">
              Advanced AI technology designed to provide you with reliable health guidance
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: IconMicrophone,
                title: "Voice-Powered",
                description: "Simply speak your symptoms in English. Our AI listens and understands naturally.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: IconBrain,
                title: "AI Analysis",
                description: "Powered by advanced AI trained on medical knowledge for accurate guidance.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: IconShieldCheck,
                title: "Private & Secure",
                description: "Your health data is encrypted and protected. Your privacy is our priority.",
                color: "from-yellow-500 to-orange-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl border border-neutral-200 bg-white p-8 transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-neutral-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500">
              <IconStethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-neutral-900 dark:text-white">Kigali AI Medical</span>
          </div>
          <p className="mt-4 text-sm text-neutral-500">
            AI-powered health guidance for Rwanda. Not a replacement for professional medical care.
          </p>
          <p className="mt-2 text-sm text-neutral-400">
            © {new Date().getFullYear()} Kigali AI Medical. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}