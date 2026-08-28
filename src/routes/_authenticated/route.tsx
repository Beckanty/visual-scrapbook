import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Chargement…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <Outlet />;
}
