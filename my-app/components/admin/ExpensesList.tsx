"use client";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { InlineSpinner } from "@/components/admin/LoadingState";
import { PaginationBar, usePagination } from "@/components/admin/Pagination";
import {
  useViewMode,
  ViewModeToggle,
} from "@/components/admin/ViewModeToggle";
import { useDeleteExpenseMutation } from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import type { ExpenseEntry } from "@/lib/types";
import {
  formatDayGroupLabel,
  formatPKR,
  formatTime,
  toLocalDateKey,
} from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export function ExpensesList({ expenses }: { expenses: ExpenseEntry[] }) {
  const { view, changeView } = useViewMode("yasin-rms-expenses-view");
  const sorted = useMemo(
    () =>
      [...expenses].sort(
        (a, b) =>
          new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
      ),
    [expenses]
  );

  const {
    page,
    totalPages,
    pageItems,
    total,
    from,
    to,
    pageSize,
    setPageSize,
    goTo,
  } = usePagination(sorted);

  const grouped = useMemo(() => {
    const map = new Map<string, ExpenseEntry[]>();
    for (const entry of pageItems) {
      const key = toLocalDateKey(entry.occurred_at);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [pageItems]);

  if (expenses.length === 0) {
    return (
      <p className="text-sm text-gray-text">
        No entries this month. Add cash in or cash out above.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-text">{total} entries</p>
        <ViewModeToggle view={view} onChange={changeView} />
      </div>

      <div className="space-y-6">
        {grouped.map(([dayKey, items]) => (
          <div key={dayKey}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-text">
              {formatDayGroupLabel(dayKey)}
            </h3>
            {view === "grid" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((entry) => (
                  <ExpenseCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-soft">
                <ul className="divide-y divide-gray-soft">
                  {items.map((entry) => (
                    <ExpenseRow key={entry.id} entry={entry} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5">
        <PaginationBar
          page={page}
          totalPages={totalPages}
          from={from}
          to={to}
          total={total}
          pageSize={pageSize}
          onPageChange={goTo}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}

function TypeChip({ type }: { type: ExpenseEntry["entry_type"] }) {
  const isIn = type === "in";
  return (
    <span
      className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
        isIn
          ? "border-emerald/30 bg-emerald/10 text-emerald"
          : "border-red/30 bg-red/10 text-red"
      }`}
    >
      {isIn ? "In" : "Out"}
    </span>
  );
}

function ExpenseCard({ entry }: { entry: ExpenseEntry }) {
  return (
    <div className="rounded-xl border border-gray-soft bg-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TypeChip type={entry.entry_type} />
            <span className="text-[11px] text-gray-text">
              {formatTime(entry.occurred_at)}
            </span>
          </div>
          <p className="mt-1.5 truncate text-sm font-semibold text-ink">
            {entry.title}
          </p>
          {entry.notes ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-text">
              {entry.notes}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-end">
          <p
            className={`text-sm font-bold ${
              entry.entry_type === "in" ? "text-emerald" : "text-red"
            }`}
          >
            {entry.entry_type === "in" ? "+" : "−"}
            {formatPKR(entry.amount)}
          </p>
          <DeleteButton entry={entry} />
        </div>
      </div>
    </div>
  );
}

function ExpenseRow({ entry }: { entry: ExpenseEntry }) {
  return (
    <li className="flex items-center gap-3 bg-white px-3 py-3 sm:px-4">
      <TypeChip type={entry.entry_type} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{entry.title}</p>
        <p className="text-[11px] text-gray-text">
          {formatTime(entry.occurred_at)}
          {entry.notes ? ` · ${entry.notes}` : ""}
        </p>
      </div>
      <p
        className={`shrink-0 text-sm font-bold ${
          entry.entry_type === "in" ? "text-emerald" : "text-red"
        }`}
      >
        {entry.entry_type === "in" ? "+" : "−"}
        {formatPKR(entry.amount)}
      </p>
      <DeleteButton entry={entry} />
    </li>
  );
}

function DeleteButton({ entry }: { entry: ExpenseEntry }) {
  const [open, setOpen] = useState(false);
  const [remove, { isLoading }] = useDeleteExpenseMutation();
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setError(null);
    try {
      await remove(entry.id).unwrap();
      setOpen(false);
    } catch (err) {
      setError(rtkErrorMessage(err, "Failed to delete."));
    }
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        disabled={isLoading}
        title="Delete"
        className="rounded-lg p-1.5 text-gray-text hover:bg-red/10 hover:text-red disabled:opacity-50"
      >
        {isLoading ? <InlineSpinner /> : <Trash2 size={16} />}
      </button>
      <ConfirmDialog
        open={open}
        title="Delete this entry?"
        description={`Remove “${entry.title}” (${entry.entry_type === "in" ? "Cash In" : "Cash Out"} · ${formatPKR(entry.amount)}). This cannot be undone.`}
        loading={isLoading}
        error={error}
        onCancel={() => {
          if (!isLoading) setOpen(false);
        }}
        onConfirm={onConfirm}
      />
    </div>
  );
}
