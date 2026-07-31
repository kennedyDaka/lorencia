import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth";

interface RouterContext {
  auth: {
    userId: string | null;
    isLoading: boolean;
  };
}

export const Route = createRootRoute({
  beforeLoad: (): RouterContext => {
    const { userId, isLoading } = useAuthStore.getState();
    return {
      auth: { userId, isLoading },
    };
  },
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
