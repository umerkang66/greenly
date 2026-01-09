"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { EcoCoach } from "@/components/EcoCoach";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideHeader = false;
    const isAuthPage = ["/signin", "/signup", "/forgot-password", "/verify-email"].some(path => pathname?.startsWith(path));

    return (
        <div className="flex min-h-screen flex-col">
            {!hideHeader && <Header />}
            <main className={`flex-1 ${!isAuthPage ? "pt-16" : ""}`}>
                {children}
            </main>
            <EcoCoach />
        </div>
    );
}
