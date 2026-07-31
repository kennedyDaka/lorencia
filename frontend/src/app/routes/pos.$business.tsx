import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api";
import type { Product } from "@lorencia/shared";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface PosParams {
  business: string;
}

export const Route = createFileRoute("/pos/$business")({
  head: ({ params }) => {
    const b = BUSINESSES[params.business as keyof typeof BUSINESSES];
    return {
      meta: [{ title: `${b?.name ?? "POS"} — Lorencia` }],
    };
  },
  component: PosPage,
});

function PosPage() {
  const { business } = Route.useParams();
  const b = BUSINESSES[business as keyof typeof BUSINESSES];

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["pos-products", business],
    queryFn: () => apiGet<Product[]>(`/pos/products/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const [cart, setCart] = useState<Record<string, { product: Product; qty: number }>>({});

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev[product.id];
      if (existing) {
        return {
          ...prev,
          [product.id]: { ...existing, qty: existing.qty + 1 },
        };
      }
      return { ...prev, [product.id]: { product, qty: 1 } };
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
            <Link
              to={`/pos/${business}/inventory`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Inventory
            </Link>
            <Link
              to={`/pos/${business}/expenses`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Expenses
            </Link>
            <Link
              to={`/pos/${business}/customers`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Customers
            </Link>
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
                {product.stockQty > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">Stock: {product.stockQty}</div>
                )}
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
}
