import { Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import { ArrowLeft, Boxes, Plus, Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RawMaterial {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  stockQty: number;
  unitCost: number;
  lowStockThreshold: number;
  isActive: boolean;
}

export function RawMaterialsPage() {
  const { business } = useParams({ from: "/pos/$business/raw-materials" });
  const b = BUSINESSES[business as keyof typeof BUSINESSES];
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showPurchase, setShowPurchase] = useState<RawMaterial | null>(null);
  const [formData, setFormData] = useState({ name: "", category: "", unit: "kg", stockQty: "", unitCost: "", lowStockThreshold: "5" });
  const [purchaseData, setPurchaseData] = useState({ qtyAdded: "", unitCost: "", note: "" });

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["raw-materials", business],
    queryFn: () => apiGet<RawMaterial[]>(`/pos/raw-materials/business/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost("/pos/raw-materials", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw-materials", business] });
      setShowForm(false);
      setFormData({ name: "", category: "", unit: "kg", stockQty: "", unitCost: "", lowStockThreshold: "5" });
      toast.success("Material created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const purchaseMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost("/pos/raw-materials/purchase", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw-materials", business] });
      setShowPurchase(null);
      setPurchaseData({ qtyAdded: "", unitCost: "", note: "" });
      toast.success("Purchase recorded");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b || !formData.name) return;
    createMutation.mutate({
      businessId: b.id,
      name: formData.name,
      category: formData.category || undefined,
      unit: formData.unit,
      stockQty: parseFloat(formData.stockQty) || 0,
      unitCost: parseFloat(formData.unitCost) || 0,
      lowStockThreshold: parseFloat(formData.lowStockThreshold) || 5,
    });
  };

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPurchase || !b) return;
    purchaseMutation.mutate({
      rawMaterialId: showPurchase.id,
      businessId: b.id,
      qtyAdded: parseFloat(purchaseData.qtyAdded),
      unitCost: parseFloat(purchaseData.unitCost),
      note: purchaseData.note || undefined,
    });
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
            <Boxes className="h-5 w-5" />
            <h1 className="text-lg font-bold">Raw Materials</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground font-medium hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Material
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {showForm && (
          <form onSubmit={handleCreate} className="rounded-lg border border-border bg-card p-4 space-y-4">
            <h2 className="font-medium">Add Raw Material</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="text-sm font-medium">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required /></div>
              <div><label className="text-sm font-medium">Category</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Flour, Sugar" /></div>
              <div><label className="text-sm font-medium">Unit</label>
                <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="kg">kg</option><option value="g">g</option><option value="l">L</option><option value="ml">ml</option><option value="pcs">pcs</option>
                </select></div>
              <div><label className="text-sm font-medium">Initial Stock</label>
                <input type="number" value={formData.stockQty} onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" /></div>
              <div><label className="text-sm font-medium">Unit Cost (MWK)</label>
                <input type="number" value={formData.unitCost} onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" /></div>
              <div><label className="text-sm font-medium">Low Stock Threshold</label>
                <input type="number" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" /></div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
              <button type="submit" disabled={createMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2">
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : materials.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No raw materials yet.</div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Material</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-right px-4 py-3 font-medium">Stock</th>
                <th className="text-right px-4 py-3 font-medium">Unit Cost</th>
                <th className="text-right px-4 py-3 font-medium">Value</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {materials.map((m) => {
                  const isLow = m.stockQty <= m.lowStockThreshold && m.stockQty > 0;
                  return (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{m.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.category || "—"}</td>
                      <td className={`px-4 py-3 text-right font-medium ${isLow ? "text-warning" : ""}`}>
                        {m.stockQty} {m.unit}
                      </td>
                      <td className="px-4 py-3 text-right">{formatMK(m.unitCost)}</td>
                      <td className="px-4 py-3 text-right">{formatMK(m.stockQty * m.unitCost)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setShowPurchase(m); setPurchaseData({ qtyAdded: "", unitCost: String(m.unitCost), note: "" }); }}
                          className="text-primary hover:underline text-sm">
                          Purchase
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 max-w-sm w-full space-y-4">
            <h2 className="text-lg font-bold">Record Purchase</h2>
            <p className="text-sm text-muted-foreground">{showPurchase.name}</p>
            <form onSubmit={handlePurchase} className="space-y-4">
              <div><label className="text-sm font-medium">Quantity Added ({showPurchase.unit})</label>
                <input type="number" value={purchaseData.qtyAdded} onChange={(e) => setPurchaseData({ ...purchaseData, qtyAdded: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0.01" step="0.01" required /></div>
              <div><label className="text-sm font-medium">Unit Cost (MWK)</label>
                <input type="number" value={purchaseData.unitCost} onChange={(e) => setPurchaseData({ ...purchaseData, unitCost: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" required /></div>
              <div><label className="text-sm font-medium">Note</label>
                <input type="text" value={purchaseData.note} onChange={(e) => setPurchaseData({ ...purchaseData, note: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Optional" /></div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowPurchase(null)} className="flex-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                <button type="submit" disabled={purchaseMutation.isPending}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  {purchaseMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
