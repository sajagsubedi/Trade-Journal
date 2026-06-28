"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { TrendingUp } from "lucide-react";

export default function Protected({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/signin");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
                        <TrendingUp className="h-7 w-7 text-primary-foreground animate-pulse" />
                    </div>
                    <p className="text-sm text-muted-foreground">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return <>{children}</>;
}
