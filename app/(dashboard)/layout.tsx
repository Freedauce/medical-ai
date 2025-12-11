import { Sidebar } from "@/app/_components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <Sidebar />
            <main className="ml-64 min-h-screen p-8">
                {children}
            </main>
        </div>
    );
}
