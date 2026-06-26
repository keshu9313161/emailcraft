import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Inbox, Loader2, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { EmailEntry } from "../backend.d";
import {
  useClearHistory,
  useDeleteEmail,
  useHistory,
} from "../hooks/useQueries";

interface Props {
  onLoad: (entry: EmailEntry) => void;
}

function formatDate(nanos: bigint): string {
  const ms = Number(nanos / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HistorySection({ onLoad }: Props) {
  const { data: history, isLoading } = useHistory();
  const deleteEmail = useDeleteEmail();
  const clearHistory = useClearHistory();
  const [search, setSearch] = useState("");

  const handleDelete = async (id: bigint) => {
    try {
      await deleteEmail.mutateAsync(id);
      toast.success("Email deleted");
    } catch {
      toast.error("Failed to delete email");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearHistory.mutateAsync();
      toast.success("History cleared");
    } catch {
      toast.error("Failed to clear history");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-48"
        data-ocid="history.loading_state"
      >
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const entries = history || [];

  const filteredEntries = search.trim()
    ? entries.filter(
        (e) =>
          e.subject.toLowerCase().includes(search.toLowerCase()) ||
          e.emailBody.toLowerCase().includes(search.toLowerCase()),
      )
    : entries;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground mt-1">
            {entries.length} saved {entries.length === 1 ? "email" : "emails"}
          </p>
        </div>
        {entries.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={clearHistory.isPending}
                data-ocid="history.clear_all.button"
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                {clearHistory.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Clear all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="history.clear_confirm.dialog">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your saved emails. This
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="history.clear_confirm.cancel_button">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="history.clear_confirm.confirm_button"
                  onClick={handleClearAll}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Search */}
      {entries.length > 0 && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="history.search.search_input"
            placeholder="Search by subject or content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {entries.length === 0 ? (
        <div
          data-ocid="history.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No emails saved yet</h3>
          <p className="text-muted-foreground mt-1 text-sm max-w-xs">
            Emails you compose and save will appear here so you can revisit or
            reuse them.
          </p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div
          data-ocid="history.search.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground"
        >
          <Search className="w-8 h-8 mb-3 opacity-30" />
          <p className="text-sm">No emails match &quot;{search}&quot;.</p>
        </div>
      ) : (
        <ul data-ocid="history.list" className="space-y-3">
          {filteredEntries.map((entry, i) => (
            <li
              key={String(entry.id)}
              data-ocid={`history.item.${i + 1}`}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm truncate">
                      {entry.subject}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {entry.tone}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    To:{" "}
                    <span className="font-medium text-foreground">
                      {entry.recipientName}
                    </span>
                    {" · "}
                    {formatDate(entry.createdAt)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {entry.emailBody.substring(0, 200)}
                    {entry.emailBody.length > 200 ? "…" : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid={`history.load.button.${i + 1}`}
                    onClick={() => onLoad(entry)}
                    className="gap-1.5"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-ocid={`history.delete_button.${i + 1}`}
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleteEmail.isPending}
                    className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
