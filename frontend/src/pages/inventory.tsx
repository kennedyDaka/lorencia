import { Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import { ArrowLeft, Package, AlertTriangle, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string | null;
  stockQty: number;
  lowStockThreshold: number;
  isActive: boolean;
}

interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  qtyChange: number;
  previousQty: number;
  newQty: number;
  reason: string;
  note: string | null;
  createdAt: string;
}

const emptyProduct = { name: "", price: "", stockQty: "", lowStockThreshold: "5", category: "" };

export function InventoryPage() {
  const { business } = useParams({ from: "/pos/$business/inventory" });
  const b = BUSINESSES[business as keyof typeof BUSINESSES];
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("manual_adjustment");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyProduct);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", category: "", lowStockThreshold: "" });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["pos-products", business],
    queryFn: () => apiGet<Product[]>(`/pos/products/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: ["low-stock", business],
    queryFn: () => apiGet<Product[]>(`/pos/inventory/low-stock?businessId=${b?.id ?? ""}`),
    enabled: !!b,
  });

  const { data: movements = [] } = useQuery({
    queryKey: ["stock-movements", business],
    queryFn: () => apiGet<StockMovement[]>(`/pos/inventory/movements?businessId=${b?.id ?? ""}`),
    enabled: !!b,
  });

  const adjustMutation = useMutation({
    mutationFn: (data: { businessId: string; productId: string; newQty: number; reason: string }) =>
      apiPost("/pos/inventory/adjust", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-products", business] });
      queryClient.invalidateQueries({ queryKey: ["low-stock", business] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements", business] });
      setAdjustingProduct(null);
      setAdjustQty("");
      toast.success("Stock adjusted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost("/pos/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-products", business] });
      setShowAddForm(false);
      setAddForm(emptyProduct);
      toast.success("Product added");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch("/pos/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-products", business] });
      setEditingProduct(null);
      toast.success("Product updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/pos/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-products", business] });
      queryClient.invalidateQueries({ queryKey: ["low-stock", business] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements", business] });
      toast.success("Product deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filteredProducts = products.filter((p) =>
    search === "" ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdjust = () => {
    if (!adjustingProduct || !adjustQty || !b) return;
    const parsed = Number(adjustQty);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    adjustMutation.mutate({
      businessId: b.id,
      productId: adjustingProduct.id,
      newQty: parsed,
      reason: adjustReason,
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b || !addForm.name) return;
    const price = parseFloat(addForm.price);
    const stockQty = parseFloat(addForm.stockQty);
    if (!Number.isFinite(price) || !Number.isFinite(stockQty)) {
      toast.error("Price and stock must be valid numbers");
      return;
    }
    createMutation.mutate({
      businessId: b.id,
      name: addForm.name,
      price,
      stockQty,
      lowStockThreshold: parseFloat(addForm.lowStockThreshold) || 5,
      category: addForm.category || undefined,
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const price = parseFloat(editForm.price);
    if (!Number.isFinite(price)) {
      toast.error("Price must be a valid number");
      return;
    }
    updateMutation.mutate({
      id: editingProduct.id,
      name: editForm.name,
      price,
      category: editForm.category || undefined,
      lowStockThreshold: parseFloat(editForm.lowStockThreshold) || 5,
    });
  };

  const handleDelete = (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(product.id);
  };

  if (!b) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Business not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/pos/$business" params={{ business }} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Package className="h-5 w-5" />
            <h1 className="text-lg font-bold">Inventory</h1>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground font-medium hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
        {/* Add Product Form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="rounded-lg border border-border bg-card p-4 space-y-4">
            <h2 className="font-medium">Add New Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="text-sm font-medium">Price (MWK) *</label>
                <input type="number" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" required />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <input type="text" value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Coffee, Pastries" />
              </div>
              <div>
                <label className="text-sm font-medium">Initial Stock *</label>
                <input type="number" value={addForm.stockQty} onChange={(e) => setAddForm({ ...addForm, stockQty: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" required />
              </div>
              <div>
                <label className="text-sm font-medium">Low Stock Threshold</label>
                <input type="number" value={addForm.lowStockThreshold} onChange={(e) => setAddForm({ ...addForm, lowStockThreshold: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
              <button type="submit" disabled={createMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2">
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Add Product
              </button>
            </div>
          </form>
        )}

        {/* Low Stock Alert */}
        {lowStock.length > 0 && (
          <div className="rounded-lg border border-warning/50 bg-warning/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="font-medium text-warning">Low Stock Alert</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              {lowStock.length} product{lowStock.length !== 1 ? "s" : ""} below threshold
            </div>
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />

        {/* Products Table */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-right px-4 py-3 font-medium">Stock</th>
                  <th className="text-right px-4 py-3 font-medium">Threshold</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isLow = product.stockQty <= product.lowStockThreshold && product.stockQty > 0;
                  const isOut = product.stockQty === 0;
                  return (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{product.name}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{product.category || "—"}</td>
                      <td className="px-4 py-3 text-right">{formatMK(Number(product.price))}</td>
                      <td className={`px-4 py-3 text-right font-medium ${isOut ? "text-destructive" : isLow ? "text-warning" : ""}`}>
                        {product.stockQty}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{product.lowStockThreshold}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setAdjustingProduct(product);
                              setAdjustQty(String(product.stockQty));
                            }}
                            className="text-primary hover:underline text-sm"
                          >
                            Adjust
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setEditForm({
                                name: product.name,
                                price: String(Number(product.price)),
                                category: product.category || "",
                                lowStockThreshold: String(product.lowStockThreshold),
                              });
                            }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Edit product"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            title="Delete product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Movements */}
        {movements.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Recent Stock Movements</h2>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">Product</th>
                    <th className="text-right px-4 py-3 font-medium">Change</th>
                    <th className="text-right px-4 py-3 font-medium">Previous</th>
                    <th className="text-right px-4 py-3 font-medium">New</th>
                    <th className="text-left px-4 py-3 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.slice(0, 20).map((m) => (
                    <tr key={m.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">{m.productName || m.productId}</td>
                      <td className={`px-4 py-3 text-right font-medium ${m.qtyChange > 0 ? "text-success" : "text-destructive"}`}>
                        {m.qtyChange > 0 ? "+" : ""}{m.qtyChange}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{m.previousQty}</td>
                      <td className="px-4 py-3 text-right">{m.newQty}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-sm w-full space-y-4">
            <h2 className="text-lg font-bold">Adjust Stock</h2>
            <p className="text-sm text-muted-foreground">{adjustingProduct.name}</p>
            <div>
              <label className="text-sm font-medium">New Quantity</label>
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="manual_adjustment">Manual Adjustment</option>
                <option value="stock_count">Stock Count</option>
                <option value="damaged">Damaged</option>
                <option value="expired">Expired</option>
                <option value="returned">Returned</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAdjustingProduct(null)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={adjustMutation.isPending}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {adjustMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-sm w-full space-y-4">
            <h2 className="text-lg font-bold">Edit Product</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="text-sm font-medium">Price (MWK)</label>
                <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" required />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <input type="text" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">Low Stock Threshold</label>
                <input type="number" value={editForm.lowStockThreshold} onChange={(e) => setEditForm({ ...editForm, lowStockThreshold: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditingProduct(null)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                <button type="submit" disabled={updateMutation.isPending}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
