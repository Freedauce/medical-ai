import { Sidebar } from "@/app/_components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <Sidebar />
            {/* Add pt-16 on mobile for the header bar, lg:pt-0 for desktop */}
            {/* Change ml-64 to lg:ml-64 so sidebar margin only applies on large screens */}
            <main className="min-h-screen p-4 pt-20 sm:p-6 lg:ml-64 lg:p-8 lg:pt-8">
                {children}
            </main>
        </div>
    );
}
