import {
  createRootRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";
import { HomePage } from "./pages/home";
import { AuthPage } from "./pages/auth";
import { DashboardPage } from "./pages/dashboard";
import { PosPage } from "./pages/pos";
import { InventoryPage } from "./pages/inventory";
import { ExpensesPage } from "./pages/expenses";
import { CustomersPage } from "./pages/customers";
import { CateringPage } from "./pages/catering";
import { RawMaterialsPage } from "./pages/raw-materials";
import { AccountingPage } from "./pages/accounting";
import { PayrollPage } from "./pages/payroll";
import { ReportsPage } from "./pages/reports";

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

const posCateringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/$business/catering",
  component: CateringPage,
});

const posRawMaterialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/$business/raw-materials",
  component: RawMaterialsPage,
});

const posAccountingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/$business/accounting",
  component: AccountingPage,
});

const posPayrollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/$business/payroll",
  component: PayrollPage,
});

const posReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/$business/reports",
  component: ReportsPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  dashboardRoute,
  posRoute,
  posInventoryRoute,
  posExpensesRoute,
  posCustomersRoute,
  posCateringRoute,
  posRawMaterialsRoute,
  posAccountingRoute,
  posPayrollRoute,
  posReportsRoute,
]);
