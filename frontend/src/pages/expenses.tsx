import { Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import { ArrowLeft, Receipt, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Expense {
  id: string;
  category: string;
  amount: number;
  note: string | null;
  createdAt: string;
}

export function ExpensesPage() {
  const { business } = useParams({ from: "/pos/$business/expenses" });
  const b = BUSINESSES[business as keyof typeof BUSINESSES];
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", business],
    queryFn: () => apiGet<Expense[]>(`/expenses/business/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const createMutation = useMutation({
    mutationFn: (data: { businessId: string; category: string; amount: number; note?: string }) =>
      apiPost("/pos/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", business] });
      setShowForm(false);
      setCategory("");
      setAmount("");
      setNote("");
      toast.success("Expense recorded");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b || !category || !amount) return;
    createMutation.mutate({
      businessId: b.id,
      category,
      amount: parseFloat(amount),
      note: note || undefined,
    });
  };

  if (!b) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Business not found.</div>;
  }

  const categories = ["Supplies", "Rent", "Utilities", "Salaries", "Raw Materials", "Maintenance", "Marketing", "Other"];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/pos/${business}`} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Receipt className="h-5 w-5" />
            <h1 className="text-lg font-bold">Expenses</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground font-medium hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Expense
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* New Expense Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-4 space-y-4">
            <h2 className="font-medium">Record Expense</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Amount (MWK)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="What was this expense for?"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Expense
              </button>
            </div>
          </form>
        )}

        {/* Expenses List */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No expenses recorded yet.</div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatMK(expense.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{expense.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
