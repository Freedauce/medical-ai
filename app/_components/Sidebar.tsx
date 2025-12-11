"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    IconHome,
    IconMicrophone,
    IconHistory,
    IconUser,
    IconStethoscope,
    IconLogout
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: IconHome },
    { href: "/consultation", label: "New Consultation", icon: IconMicrophone },
    { href: "/history", label: "History", icon: IconHistory },
    { href: "/profile", label: "Profile", icon: IconUser },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex items-center gap-3 border-b border-neutral-200 p-6 dark:border-neutral-800">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500">
                        <IconStethoscope className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
                            Kigali AI
                        </h1>
                        <p className="text-xs text-neutral-500">Medical Assistant</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-500/10 to-green-500/10 text-blue-600 dark:text-blue-400"
                                        : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt={session.user.name || "User"}
                                className="h-10 w-10 rounded-full"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-500">
                                <IconUser className="h-5 w-5 text-white" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                                {session?.user?.name || "User"}
                            </p>
                            <p className="truncate text-xs text-neutral-500">
                                {session?.user?.email || ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                        <IconLogout className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
