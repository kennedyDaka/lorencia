import { Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/services/api";
import { BUSINESSES } from "@/lib/businesses";
import { formatMK } from "@/lib/utils";
import { ArrowLeft, ChefHat, Plus, Loader2, Calendar, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CateringEvent {
  id: string;
  eventDate: string;
  venue: string | null;
  guests: number;
  quotedAmount: number;
  depositPaid: number;
  status: string;
  notes: string | null;
  customer?: { name: string } | null;
  costs?: Array<{ description: string; amount: number; category: string }>;
}

export function CateringPage() {
  const { business } = useParams({ from: "/pos/$business/catering" });
  const b = BUSINESSES[business as keyof typeof BUSINESSES];
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    eventDate: "",
    venue: "",
    guests: "",
    quotedAmount: "",
    depositPaid: "",
    notes: "",
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["catering", business],
    queryFn: () => apiGet<CateringEvent[]>(`/catering/business/${b?.id ?? ""}`),
    enabled: !!b,
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost("/catering", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catering", business] });
      setShowForm(false);
      setFormData({ eventDate: "", venue: "", guests: "", quotedAmount: "", depositPaid: "", notes: "" });
      toast.success("Event created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/catering/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catering", business] });
      toast.success("Status updated");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!b || !formData.eventDate) return;
    createMutation.mutate({
      businessId: b.id,
      eventDate: formData.eventDate,
      venue: formData.venue || undefined,
      guests: parseInt(formData.guests) || 0,
      quotedAmount: parseFloat(formData.quotedAmount) || 0,
      depositPaid: parseFloat(formData.depositPaid) || 0,
      notes: formData.notes || undefined,
    });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    confirmed: "bg-primary/10 text-primary",
    completed: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
  };

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
            <ChefHat className="h-5 w-5" />
            <h1 className="text-lg font-bold">Catering</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground font-medium hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Event
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-4 space-y-4">
            <h2 className="font-medium">New Catering Event</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Event Date *</label>
                <input type="date" value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="text-sm font-medium">Venue</label>
                <input type="text" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Event location" />
              </div>
              <div>
                <label className="text-sm font-medium">Guests</label>
                <input type="number" value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" />
              </div>
              <div>
                <label className="text-sm font-medium">Quoted Amount (MWK)</label>
                <input type="number" value={formData.quotedAmount} onChange={(e) => setFormData({ ...formData, quotedAmount: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" />
              </div>
              <div>
                <label className="text-sm font-medium">Deposit Paid (MWK)</label>
                <input type="number" value={formData.depositPaid} onChange={(e) => setFormData({ ...formData, depositPaid: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min="0" />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
              <button type="submit" disabled={createMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2">
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Event
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No catering events yet.</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{new Date(event.eventDate).toLocaleDateString()}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[event.status] || "bg-muted"}`}>
                        {event.status}
                      </span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {event.venue}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {event.guests} guests
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatMK(event.quotedAmount)}</div>
                    <div className="text-sm text-muted-foreground">
                      Deposit: {formatMK(event.depositPaid)}
                    </div>
                  </div>
                </div>
                {event.status === "pending" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button onClick={() => statusMutation.mutate({ id: event.id, status: "confirmed" })}
                      className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                      Confirm
                    </button>
                    <button onClick={() => statusMutation.mutate({ id: event.id, status: "cancelled" })}
                      className="text-xs px-3 py-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20">
                      Cancel
                    </button>
                  </div>
                )}
                {event.status === "confirmed" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button onClick={() => statusMutation.mutate({ id: event.id, status: "completed" })}
                      className="text-xs px-3 py-1 rounded-full bg-success/10 text-success hover:bg-success/20">
                      Mark Completed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
