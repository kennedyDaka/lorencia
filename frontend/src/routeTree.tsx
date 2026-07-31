import {
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { HomePage } from "./pages/home";
import { AuthPage } from "./pages/auth";
import { DashboardPage } from "./pages/dashboard";
import { AuthenticatedLayout } from "./pages/authenticated-layout";
import { PosPage } from "./pages/pos";
import { InventoryPage } from "./pages/inventory";
import { ExpensesPage } from "./pages/expenses";
import { CustomersPage } from "./pages/customers";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  component: AuthenticatedLayout,
});

const businessRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/$business",
  component: () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold capitalize">Business</h1>
      <Outlet />
    </div>
  ),
});

const posRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/$business",
  component: PosPage,
});

const posInventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/$business/inventory",
  component: InventoryPage,
});

const posExpensesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/$business/expenses",
  component: ExpensesPage,
});

const posCustomersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/$business/customers",
  component: CustomersPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  dashboardRoute,
  authenticatedRoute,
  businessRoute,
  posRoute,
  posInventoryRoute,
  posExpensesRoute,
  posCustomersRoute,
]);
