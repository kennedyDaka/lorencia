import { Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import { ShoppingCart, ArrowLeft, Package, Receipt, Users, ChefHat, Boxes, BookOpen, Wallet, BarChart3, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
  const { userId } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["pos-products", business],
    queryFn: () => apiGet<Product[]>(`/pos/products/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [search, setSearch] = useState("");
  const [showReceipt, setShowReceipt] = useState<{ saleId: string; total: number } | null>(null);

  const checkoutMutation = useMutation({
    mutationFn: (data: {
      businessId: string;
      items: Array<{ productId: string; productName: string; qty: number; unitPrice: number }>;
      total: number;
      paymentMethod: string;
    }) => apiPost<{ id: string; total: number }>("/pos/sales", data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["pos-products", business] });
      setCart({});
      setShowReceipt({ saleId: result.id, total: result.total });
      toast.success("Sale completed!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Checkout failed");
    },
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev[product.id];
      if (existing) {
        return { ...prev, [product.id]: { ...existing, qty: existing.qty + 1 } };
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

  const handleCheckout = () => {
    if (!b || cartItems.length === 0) return;

    checkoutMutation.mutate({
      businessId: b.id,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        qty: item.qty,
        unitPrice: Number(item.product.price),
      })),
      total: cartTotal,
      paymentMethod: "cash",
    });
  };

  // Filter products by search
  const filteredProducts = products.filter((p) =>
    search === "" || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()),
  );

  // Group products by category
  const categories = [...new Set(filteredProducts.map((p) => p.category).filter(Boolean))];

  if (!b) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Business not found.
      </div>
    );
  }

  // Receipt overlay
  if (showReceipt) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-xl p-6 max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-xl font-bold">Sale Completed!</h2>
          <p className="text-muted-foreground">Sale ID: {showReceipt.saleId.slice(0, 8)}...</p>
          <p className="text-2xl font-bold text-primary">{formatMK(showReceipt.total)}</p>
          <button
            onClick={() => setShowReceipt(null)}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-primary-foreground font-medium hover:opacity-90"
          >
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                <Link to={`/pos/${business}/inventory`} className="text-sm text-muted-foreground hover:text-foreground">
                  <Package className="h-4 w-4 inline mr-1" />Inventory
                </Link>
                <Link to={`/pos/${business}/expenses`} className="text-sm text-muted-foreground hover:text-foreground">
                  <Receipt className="h-4 w-4 inline mr-1" />Expenses
                </Link>
                <Link to={`/pos/${business}/customers`} className="text-sm text-muted-foreground hover:text-foreground">
                  <Users className="h-4 w-4 inline mr-1" />Customers
                </Link>
                <Link to={`/pos/${business}/catering`} className="text-sm text-muted-foreground hover:text-foreground">
                  <ChefHat className="h-4 w-4 inline mr-1" />Catering
                </Link>
                <Link to={`/pos/${business}/raw-materials`} className="text-sm text-muted-foreground hover:text-foreground">
                  <Boxes className="h-4 w-4 inline mr-1" />Materials
                </Link>
                <Link to={`/pos/${business}/accounting`} className="text-sm text-muted-foreground hover:text-foreground">
                  <BookOpen className="h-4 w-4 inline mr-1" />Accounting
                </Link>
                <Link to={`/pos/${business}/payroll`} className="text-sm text-muted-foreground hover:text-foreground">
                  <Wallet className="h-4 w-4 inline mr-1" />Payroll
                </Link>
                <Link to={`/pos/${business}/reports`} className="text-sm text-muted-foreground hover:text-foreground">
                  <BarChart3 className="h-4 w-4 inline mr-1" />Reports
                </Link>
                <button onClick={() => supabase.auth.signOut()} className="text-sm text-muted-foreground hover:text-foreground">
                  Sign out
                </button>
              </>
            )}
            {!userId && (
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
                Staff sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            {search ? "No products match your search." : "No products found."}
          </div>
        ) : search ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="rounded-lg border border-border bg-card p-4 text-left hover:border-primary transition-colors active:scale-95"
              >
                <div className="font-medium text-sm">{product.name}</div>
                {product.category && (
                  <div className="text-xs text-muted-foreground mt-1">{product.category}</div>
                )}
                <div className="text-primary font-bold mt-2">{formatMK(Number(product.price))}</div>
                {product.stockQty > 0 && product.stockQty <= 10 && (
                  <div className="text-xs text-warning mt-1">Low stock: {product.stockQty}</div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  {category || "Uncategorized"}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts
                    .filter((p) => p.category === category)
                    .map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="rounded-lg border border-border bg-card p-4 text-left hover:border-primary transition-colors active:scale-95"
                      >
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-primary font-bold mt-2">{formatMK(Number(product.price))}</div>
                        {product.stockQty > 0 && product.stockQty <= 10 && (
                          <div className="text-xs text-warning mt-1">Low stock: {product.stockQty}</div>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-20">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">
                  {cartItems.reduce((s, i) => s + i.qty, 0)} items
                </span>
              </div>
              <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-foreground">
                Clear
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-sm">
                  <span className="flex-1 truncate">{item.product.name}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => updateQty(item.product.id, -1)}
                      className="w-7 h-7 rounded border border-border flex items-center justify-center text-xs hover:bg-muted"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.product.id, 1)}
                      className="w-7 h-7 rounded border border-border flex items-center justify-center text-xs hover:bg-muted"
                    >
                      +
                    </button>
                    <span className="w-24 text-right font-medium">
                      {formatMK(Number(item.product.price) * item.qty)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="text-xl font-bold">Total: {formatMK(cartTotal)}</div>
              <button
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
                className="rounded-lg bg-primary px-8 py-2.5 text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 inline-flex items-center gap-2"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Checkout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
