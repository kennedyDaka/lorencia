import {
  createRootRoute,
  createRoute,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    // Public homepage, no guard needed
  },
  component: () => {
    const { userId, isLoading } = useAuthStore();
    const { Link } = require("@tanstack/react-router");

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold text-gradient-brand">Lorencia</h1>
          <p className="text-muted-foreground">Cafe & Gift Shop Manager</p>
          {userId ? (
            <div className="space-y-4">
              <Link
                to="/pos/cafe"
                className="block w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Open POS — Cafe
              </Link>
              <Link
                to="/pos/gift-shop"
                className="block w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Open POS — Gift Shop
              </Link>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-block rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    );
  },
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: () => {
    const [email, setEmail] = require("react").useState("");
    const [password, setPassword] = require("react").useState("");
    const [loading, setLoading] = require("react").useState(false);
    const { supabase } = require("@/lib/supabase");
    const { toast } = require("sonner");
    const { Link } = require("@tanstack/react-router");

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Signed in");
        window.location.href = "/";
      }
      setLoading(false);
    };

    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gradient-brand">Lorencia</h1>
            <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
      </div>
    );
  },
});

const posRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/$business",
  component: () => {
    const {BUSINESSES} = require("@/lib/businesses");
    const {useParams, Link} = require("@tanstack/react-router");
    const {useQuery} = require("@tanstack/react-query");
    const {apiGet} = require("@/services/api");
    const {formatMK} = require("@/lib/utils");
    const {useState} = require("react");
    const {ShoppingCart, ArrowLeft} = require("lucide-react");

    const {business} = useParams();
    const b = BUSINESSES[business];

    const {data: products = [], isLoading} = useQuery({
      queryKey: ["pos-products", business],
      queryFn: () => apiGet(`/pos/products/${b?.id ?? ""}`),
      enabled: !!b,
    });

    const [cart, setCart] = useState({});

    const addToCart = (product) => {
      setCart((prev) => {
        const existing = prev[product.id];
        if (existing) {
          return {...prev, [product.id]: {...existing, qty: existing.qty + 1}};
        }
        return {...prev, [product.id]: {product, qty: 1}};
      });
    };

    const cartItems = Object.values(cart);
    const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);

    if (!b) {
      return (
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Business not found.
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold">{b.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/pos/${business}/inventory`} className="text-sm text-muted-foreground hover:text-foreground">Inventory</Link>
              <Link to={`/pos/${business}/expenses`} className="text-sm text-muted-foreground hover:text-foreground">Expenses</Link>
              <Link to={`/pos/${business}/customers`} className="text-sm text-muted-foreground hover:text-foreground">Customers</Link>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">Loading products...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="rounded-lg border border-border bg-card p-4 text-left hover:border-primary transition-colors"
                >
                  <div className="font-medium text-sm">{product.name}</div>
                  {product.category && (
                    <div className="text-xs text-muted-foreground mt-1">{product.category}</div>
                  )}
                  <div className="text-primary font-bold mt-2">{formatMK(product.price)}</div>
                </button>
              ))}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">{cartItems.length} items</span>
                </div>
                <div className="text-xl font-bold">{formatMK(cartTotal)}</div>
                <button className="rounded-lg bg-primary px-6 py-2 text-primary-foreground font-medium hover:opacity-90">
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  posRoute,
]);
