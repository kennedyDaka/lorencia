import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import { ShoppingCart, ArrowLeft, Package, Receipt, Users } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string | null;
  stockQty: number;
}

interface CartItem {
  product: Product;
  qty: number;
}

export function PosPage() {
  const { business } = useParams({ from: "/pos/$business" });
  const b = BUSINESSES[business as keyof typeof BUSINESSES];
  const { userId, email } = useAuthStore();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["pos-products", business],
    queryFn: () => apiGet<Product[]>(`/pos/products/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const [cart, setCart] = useState<Record<string, CartItem>>({});

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

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const item = prev[productId];
      if (!item) return prev;
      const newQty = item.qty + delta;
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: { ...item, qty: newQty } };
    });
  };

  const clearCart = () => setCart({});

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.qty,
    0,
  );

  if (!b) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Business not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold">{b.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            {userId && (
              <>
                <Link
                  to={`/pos/${business}/inventory`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Package className="h-4 w-4" />
                  Inventory
                </Link>
                <Link
                  to={`/pos/${business}/expenses`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Receipt className="h-4 w-4" />
                  Expenses
                </Link>
                <Link
                  to={`/pos/${business}/customers`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Users className="h-4 w-4" />
                  Customers
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            )}
            {!userId && (
              <Link
                to="/auth"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Staff sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="rounded-lg border border-border bg-card p-4 text-left hover:border-primary transition-colors active:scale-95"
              >
                <div className="font-medium text-sm">{product.name}</div>
                {product.category && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {product.category}
                  </div>
                )}
                <div className="text-primary font-bold mt-2">
                  {formatMK(Number(product.price))}
                </div>
                {product.stockQty > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Stock: {product.stockQty}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">
                  {cartItems.reduce((s, i) => s + i.qty, 0)} items
                </span>
              </div>
              <button
                onClick={clearCart}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex-1 truncate">{item.product.name}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => updateQty(item.product.id, -1)}
                      className="w-6 h-6 rounded border border-border flex items-center justify-center text-xs hover:bg-muted"
                    >
                      -
                    </button>
                    <span className="w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.product.id, 1)}
                      className="w-6 h-6 rounded border border-border flex items-center justify-center text-xs hover:bg-muted"
                    >
                      +
                    </button>
                    <span className="w-20 text-right font-medium">
                      {formatMK(Number(item.product.price) * item.qty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="text-lg font-bold">{formatMK(cartTotal)}</div>
              <button className="rounded-lg bg-primary px-8 py-2.5 text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
