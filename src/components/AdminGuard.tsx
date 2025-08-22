import { useAdmin } from "@/hooks/useAdmin";
import { redirect } from "next/navigation";
export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthenticated, isAdmin } = useAdmin();

    if (isLoading) return <p>加载中...</p>;
    if (!isAuthenticated || !isAdmin) {
        redirect("/");
    }

    return <>{children}</>;
}