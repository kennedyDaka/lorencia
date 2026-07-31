import { Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import { ArrowLeft, BookOpen, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  parentAccountCode: string | null;
  isActive: boolean;
}

interface JournalLine {
  accountCode: string;
  debit: number;
  credit: number;
}

interface JournalEntry {
  id: string;
  entryDate: string;
  description: string;
  reference: string | null;
  lines: JournalLine[];
}

interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

const ACCOUNT_TYPES = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"] as const;

const TYPE_COLORS: Record<string, string> = {
  ASSET: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  LIABILITY: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  EQUITY: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  REVENUE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  EXPENSE: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

export function AccountingPage() {
  const { business } = useParams({ from: "/pos/$business/accounting" });
  const b = BUSINESSES[business as keyof typeof BUSINESSES];
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"accounts" | "journal" | "trial">("accounts");
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);

  const [accountCode, setAccountCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<string>("");
  const [parentAccountCode, setParentAccountCode] = useState("");

  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<{ accountCode: string; debit: string; credit: string }[]>([
    { accountCode: "", debit: "", credit: "" },
    { accountCode: "", debit: "", credit: "" },
  ]);

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ["accounts", business],
    queryFn: () => apiGet<ChartOfAccount[]>(`/accounting/accounts/business/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const { data: journalEntries = [], isLoading: loadingJournal } = useQuery({
    queryKey: ["journal", business],
    queryFn: () => apiGet<JournalEntry[]>(`/accounting/journal/business/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const { data: trialBalance = [], isLoading: loadingTrial } = useQuery({
    queryKey: ["trial-balance", business],
    queryFn: () => apiGet<TrialBalanceItem[]>(`/accounting/trial-balance/business/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const createAccountMutation = useMutation({
    mutationFn: (data: {
      businessId: string;
      code: string;
      name: string;
      type: string;
      parentAccountCode?: string;
    }) => apiPost("/accounting/accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", business] });
      setShowAccountForm(false);
      setAccountCode("");
      setAccountName("");
      setAccountType("");
      setParentAccountCode("");
      toast.success("Account created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createEntryMutation = useMutation({
    mutationFn: (data: {
      businessId: string;
      entryDate: string;
      description: string;
      reference?: string;
      lines: { accountCode: string; debit?: number; credit?: number }[];
    }) => apiPost("/accounting/journal", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal", business] });
      queryClient.invalidateQueries({ queryKey: ["trial-balance", business] });
      setShowEntryForm(false);
      setEntryDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setReference("");
      setLines([
        { accountCode: "", debit: "", credit: "" },
        { accountCode: "", debit: "", credit: "" },
      ]);
      toast.success("Journal entry created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b || !accountCode || !accountName || !accountType) return;
    createAccountMutation.mutate({
      businessId: b.id,
      code: accountCode,
      name: accountName,
      type: accountType,
      parentAccountCode: parentAccountCode || undefined,
    });
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b || !entryDate || !description) return;

    const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error("Total debits must equal total credits");
      return;
    }

    const validLines = lines
      .filter((l) => l.accountCode && (l.debit || l.credit))
      .map((l) => ({
        accountCode: l.accountCode,
        debit: parseFloat(l.debit) || undefined,
        credit: parseFloat(l.credit) || undefined,
      }));

    if (validLines.length < 2) {
      toast.error("At least two lines are required");
      return;
    }

    createEntryMutation.mutate({
      businessId: b.id,
      entryDate,
      description,
      reference: reference || undefined,
      lines: validLines,
    });
  };

  const addLine = () => {
    setLines([...lines, { accountCode: "", debit: "", credit: "" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: "accountCode" | "debit" | "credit", value: string) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const runningTotalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const runningTotalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(runningTotalDebit - runningTotalCredit) < 0.01;

  const trialDebitTotal = trialBalance.reduce((sum, item) => sum + item.totalDebit, 0);
  const trialCreditTotal = trialBalance.reduce((sum, item) => sum + item.totalCredit, 0);

  if (!b) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Business not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/pos/${business}`} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <BookOpen className="h-5 w-5" />
            <h1 className="text-lg font-bold">Accounting</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowAccountForm(!showAccountForm); setShowEntryForm(false); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              New Account
            </button>
            <button
              onClick={() => { setShowEntryForm(!showEntryForm); setShowAccountForm(false); }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground font-medium hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New Entry
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {showAccountForm && (
          <form onSubmit={handleCreateAccount} className="rounded-lg border border-border bg-card p-4 space-y-4">
            <h2 className="font-medium">Create Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Code *</label>
                <input
                  type="text"
                  value={accountCode}
                  onChange={(e) => setAccountCode(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="e.g. 1000"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Name *</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type *</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select type</option>
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Parent Account Code</label>
                <input
                  type="text"
                  value={parentAccountCode}
                  onChange={(e) => setParentAccountCode(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAccountForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createAccountMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {createAccountMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account
              </button>
            </div>
          </form>
        )}

        {showEntryForm && (
          <form onSubmit={handleCreateEntry} className="rounded-lg border border-border bg-card p-4 space-y-4">
            <h2 className="font-medium">New Journal Entry</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Date *</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                <div className="col-span-4">Account Code</div>
                <div className="col-span-3">Debit</div>
                <div className="col-span-3">Credit</div>
                <div className="col-span-2" />
              </div>
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={line.accountCode}
                    onChange={(e) => updateLine(i, "accountCode", e.target.value)}
                    className="col-span-4 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    placeholder="Account"
                  />
                  <input
                    type="number"
                    value={line.debit}
                    onChange={(e) => updateLine(i, "debit", e.target.value)}
                    className="col-span-3 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    placeholder="0"
                    min="0"
                  />
                  <input
                    type="number"
                    value={line.credit}
                    onChange={(e) => updateLine(i, "credit", e.target.value)}
                    className="col-span-3 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    placeholder="0"
                    min="0"
                  />
                  <div className="col-span-2 flex items-center justify-center">
                    {lines.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        className="text-destructive text-xs hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Add line
            </button>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Debit: <span className="font-medium text-foreground">{formatMK(runningTotalDebit)}</span></span>
                <span className="text-muted-foreground">Credit: <span className="font-medium text-foreground">{formatMK(runningTotalCredit)}</span></span>
                {isBalanced ? (
                  <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /> Balanced</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-destructive"><AlertCircle className="h-4 w-4" /> Out of balance by {formatMK(Math.abs(runningTotalDebit - runningTotalCredit))}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEntryForm(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEntryMutation.isPending || !isBalanced}
                  className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {createEntryMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Post Entry
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="flex gap-1 border-b border-border">
          {(["accounts", "journal", "trial"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "accounts" ? "Chart of Accounts" : t === "journal" ? "Journal Entries" : "Trial Balance"}
            </button>
          ))}
        </div>

        {tab === "accounts" && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {loadingAccounts ? (
              <div className="text-center text-muted-foreground py-12">Loading...</div>
            ) : accounts.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No accounts yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">Code</th>
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Parent</th>
                    <th className="text-left px-4 py-3 font-medium">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono font-medium">{a.code}</td>
                      <td className="px-4 py-3">{a.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[a.type] ?? "bg-muted"}`}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.parentAccountCode || "—"}</td>
                      <td className="px-4 py-3">
                        {a.isActive ? (
                          <span className="text-green-600 text-xs">Yes</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "journal" && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {loadingJournal ? (
              <div className="text-center text-muted-foreground py-12">Loading...</div>
            ) : journalEntries.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No journal entries yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Description</th>
                    <th className="text-left px-4 py-3 font-medium">Reference</th>
                    <th className="text-right px-4 py-3 font-medium">Debit</th>
                    <th className="text-right px-4 py-3 font-medium">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.map((entry) => {
                    const totalDebit = entry.lines.reduce((s, l) => s + (l.debit || 0), 0);
                    const totalCredit = entry.lines.reduce((s, l) => s + (l.credit || 0), 0);
                    return (
                      <tr key={entry.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(entry.entryDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-medium">{entry.description}</td>
                        <td className="px-4 py-3 text-muted-foreground">{entry.reference || "—"}</td>
                        <td className="px-4 py-3 text-right">{formatMK(totalDebit)}</td>
                        <td className="px-4 py-3 text-right">{formatMK(totalCredit)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "trial" && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {loadingTrial ? (
              <div className="text-center text-muted-foreground py-12">Loading...</div>
            ) : trialBalance.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No trial balance data.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">Account Code</th>
                    <th className="text-left px-4 py-3 font-medium">Account Name</th>
                    <th className="text-right px-4 py-3 font-medium">Debit</th>
                    <th className="text-right px-4 py-3 font-medium">Credit</th>
                    <th className="text-right px-4 py-3 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {trialBalance.map((item) => (
                    <tr key={item.accountCode} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono font-medium">{item.accountCode}</td>
                      <td className="px-4 py-3">{item.accountName}</td>
                      <td className="px-4 py-3 text-right">{formatMK(item.totalDebit)}</td>
                      <td className="px-4 py-3 text-right">{formatMK(item.totalCredit)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatMK(item.balance)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/50 font-medium">
                    <td className="px-4 py-3" colSpan={2}>Totals</td>
                    <td className="px-4 py-3 text-right">{formatMK(trialDebitTotal)}</td>
                    <td className="px-4 py-3 text-right">{formatMK(trialCreditTotal)}</td>
                    <td className="px-4 py-3 text-right">
                      {Math.abs(trialDebitTotal - trialCreditTotal) < 0.01 ? (
                        <span className="text-green-600">{formatMK(trialDebitTotal)}</span>
                      ) : (
                        <span className="text-destructive">Out of balance</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
