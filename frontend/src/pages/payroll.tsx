import { Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import { ArrowLeft, Users, Plus, Loader2, Settings, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  position: string | null;
  baseSalary: number;
  isActive: boolean;
}

interface PayrollEntry {
  id: string;
  employeeId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossPay: number;
  overtimeHours: number;
  overtimePay: number;
  pensionDeduction: number;
  payeeTax: number;
  netPay: number;
  status: string;
  paidAt: string | null;
  employee: { name: string };
}

interface PayrollSettings {
  defaultPensionPercentage: number;
  defaultOvertimeRate: number;
  standardHoursPerPeriod: number;
}

export function PayrollPage() {
  const { business } = useParams({ from: "/pos/$business/payroll" });
  const b = BUSINESSES[business as keyof typeof BUSINESSES];
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"employees" | "entries">("employees");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showGeneratePayroll, setShowGeneratePayroll] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [empName, setEmpName] = useState("");
  const [position, setPosition] = useState("");
  const [baseSalary, setBaseSalary] = useState("");

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [payPeriodStart, setPayPeriodStart] = useState("");
  const [payPeriodEnd, setPayPeriodEnd] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");

  const [pensionPct, setPensionPct] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [standardHours, setStandardHours] = useState("");

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["payroll-employees", business],
    queryFn: () => apiGet<Employee[]>(`/payroll/employees/business/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const { data: entries = [], isLoading: loadingEntries } = useQuery({
    queryKey: ["payroll-entries", business],
    queryFn: () => apiGet<PayrollEntry[]>(`/payroll/entries/business/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const { data: settings } = useQuery({
    queryKey: ["payroll-settings", business],
    queryFn: () => apiGet<PayrollSettings>(`/payroll/settings/business/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (data: { businessId: string; name: string; position?: string; baseSalary: number }) =>
      apiPost("/payroll/employees", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-employees", business] });
      resetEmployeeForm();
      setShowAddEmployee(false);
      toast.success("Employee added");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; position?: string; baseSalary?: number; isActive?: boolean }) =>
      apiPatch(`/payroll/employees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-employees", business] });
      resetEmployeeForm();
      setShowAddEmployee(false);
      setEditingEmployee(null);
      toast.success("Employee updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const generatePayrollMutation = useMutation({
    mutationFn: (data: { businessId: string; employeeId: string; payPeriodStart: string; payPeriodEnd: string; overtimeHours?: number }) =>
      apiPost("/payroll/entries", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-entries", business] });
      resetGenerateForm();
      setShowGeneratePayroll(false);
      toast.success("Payroll generated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => apiPatch(`/payroll/entries/${id}/pay`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-entries", business] });
      toast.success("Payment recorded");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { defaultPensionPercentage?: number; defaultOvertimeRate?: number; standardHoursPerPeriod?: number }) =>
      apiPatch(`/payroll/settings/business/${b?.id ?? ""}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-settings", business] });
      setShowSettings(false);
      toast.success("Settings updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetEmployeeForm = () => { setEmpName(""); setPosition(""); setBaseSalary(""); };
  const resetGenerateForm = () => { setSelectedEmployeeId(""); setPayPeriodStart(""); setPayPeriodEnd(""); setOvertimeHours(""); };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b || !empName || !baseSalary) return;
    if (editingEmployee) {
      updateEmployeeMutation.mutate({ id: editingEmployee.id, name: empName, position: position || undefined, baseSalary: parseFloat(baseSalary) });
    } else {
      createEmployeeMutation.mutate({ businessId: b.id, name: empName, position: position || undefined, baseSalary: parseFloat(baseSalary) });
    }
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b || !selectedEmployeeId || !payPeriodStart || !payPeriodEnd) return;
    generatePayrollMutation.mutate({
      businessId: b.id,
      employeeId: selectedEmployeeId,
      payPeriodStart,
      payPeriodEnd,
      overtimeHours: overtimeHours ? parseFloat(overtimeHours) : undefined,
    });
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b) return;
    updateSettingsMutation.mutate({
      defaultPensionPercentage: pensionPct ? parseFloat(pensionPct) : undefined,
      defaultOvertimeRate: overtimeRate ? parseFloat(overtimeRate) : undefined,
      standardHoursPerPeriod: standardHours ? parseFloat(standardHours) : undefined,
    });
  };

  const openEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpName(emp.name);
    setPosition(emp.position ?? "");
    setBaseSalary(String(emp.baseSalary));
    setShowAddEmployee(true);
  };

  const openSettings = () => {
    if (settings) {
      setPensionPct(String(settings.defaultPensionPercentage));
      setOvertimeRate(String(settings.defaultOvertimeRate));
      setStandardHours(String(settings.standardHoursPerPeriod));
    }
    setShowSettings(true);
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
            <Users className="h-5 w-5" />
            <h1 className="text-lg font-bold">Payroll</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { resetEmployeeForm(); setEditingEmployee(null); setShowAddEmployee(true); }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground font-medium hover:opacity-90">
              <Plus className="h-4 w-4" /> Add Employee
            </button>
            <button onClick={() => { resetGenerateForm(); setShowGeneratePayroll(true); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
              <Plus className="h-4 w-4" /> Generate Payroll
            </button>
            <button onClick={openSettings}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
              <Settings className="h-4 w-4" /> Settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
          <button onClick={() => setActiveTab("employees")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === "employees" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            Employees
          </button>
          <button onClick={() => setActiveTab("entries")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === "entries" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            Payroll Entries
          </button>
        </div>

        {showAddEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md space-y-4">
              <h2 className="font-bold text-lg">{editingEmployee ? "Edit Employee" : "Add Employee"}</h2>
              <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <input type="text" value={empName} onChange={(e) => setEmpName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Position (optional)</label>
                  <input type="text" value={position} onChange={(e) => setPosition(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Chef, Cashier" />
                </div>
                <div>
                  <label className="text-sm font-medium">Base Salary (MWK)</label>
                  <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" required />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowAddEmployee(false); setEditingEmployee(null); resetEmployeeForm(); }}
                    className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                    className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2">
                    {(createEmployeeMutation.isPending || updateEmployeeMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingEmployee ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showGeneratePayroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md space-y-4">
              <h2 className="font-bold text-lg">Generate Payroll</h2>
              <form onSubmit={handleGenerateSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Employee</label>
                  <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="">Select employee</option>
                    {employees.filter((e) => e.isActive).map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.name} - {formatMK(emp.baseSalary)}/mo</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Period Start</label>
                    <input type="date" value={payPeriodStart} onChange={(e) => setPayPeriodStart(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Period End</label>
                    <input type="date" value={payPeriodEnd} onChange={(e) => setPayPeriodEnd(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Overtime Hours (optional)</label>
                  <input type="number" value={overtimeHours} onChange={(e) => setOvertimeHours(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" step="0.5" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowGeneratePayroll(false); resetGenerateForm(); }}
                    className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={generatePayrollMutation.isPending}
                    className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2">
                    {generatePayrollMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Generate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md space-y-4">
              <h2 className="font-bold text-lg">Payroll Settings</h2>
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Default Pension %</label>
                  <input type="number" value={pensionPct} onChange={(e) => setPensionPct(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" max="100" step="0.1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Overtime Rate (x)</label>
                  <input type="number" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" step="0.1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Standard Hours/Period</label>
                  <input type="number" value={standardHours} onChange={(e) => setStandardHours(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowSettings(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                  <button type="submit" disabled={updateSettingsMutation.isPending}
                    className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2">
                    {updateSettingsMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "employees" && (
          loadingEmployees ? (
            <div className="text-center text-muted-foreground py-12">Loading...</div>
          ) : employees.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No employees yet.</div>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Position</th>
                  <th className="text-right px-4 py-3 font-medium">Base Salary</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-center px-4 py-3 font-medium">Action</th>
                </tr></thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{emp.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{emp.position || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatMK(emp.baseSalary)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${emp.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {emp.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => openEditEmployee(emp)} className="text-muted-foreground hover:text-foreground text-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === "entries" && (
          loadingEntries ? (
            <div className="text-center text-muted-foreground py-12">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No payroll entries yet.</div>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium">Employee</th>
                  <th className="text-left px-4 py-3 font-medium">Period</th>
                  <th className="text-right px-4 py-3 font-medium">Gross</th>
                  <th className="text-right px-4 py-3 font-medium">Pension</th>
                  <th className="text-right px-4 py-3 font-medium">PAYE</th>
                  <th className="text-right px-4 py-3 font-medium">Net Pay</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-center px-4 py-3 font-medium">Action</th>
                </tr></thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{entry.employee.name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(entry.payPeriodStart).toLocaleDateString()} - {new Date(entry.payPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">{formatMK(entry.grossPay)}</td>
                      <td className="px-4 py-3 text-right">{formatMK(entry.pensionDeduction)}</td>
                      <td className="px-4 py-3 text-right">{formatMK(entry.payeeTax)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatMK(entry.netPay)}</td>
                      <td className="px-4 py-3 text-center">
                        {entry.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-medium">
                            <Check className="h-3 w-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-700 px-2.5 py-0.5 text-xs font-medium">
                            {entry.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {entry.status !== "paid" && (
                          <button onClick={() => payMutation.mutate(entry.id)} disabled={payMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-xs text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
                            <Check className="h-3 w-3" /> Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
