"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function Protected({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>
        );
    }
    
    if (status === "unauthenticated") {
        return <>{children}</>;
    }

}