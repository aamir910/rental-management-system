"use client";

import {
  useDeleteReminderMutation,
  useToggleReminderDoneMutation,
} from "@/lib/store/api";
import { rtkErrorMessage } from "@/lib/store/errorMessage";
import type { Reminder, ReminderFrequency } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useMemo } from "react";
import { InlineSpinner } from "./LoadingState";
import { PaginationBar, usePagination } from "./Pagination";

const ORDER: ReminderFrequency[] = ["daily", "weekly", "monthly"];

export function RemindersList({ reminders }: { reminders: Reminder[] }) {
  const sorted = useMemo(() => {
    return [...reminders].sort((a, b) => {
      const ai = ORDER.indexOf(a.frequency);
      const bi = ORDER.indexOf(b.frequency);
      if (ai !== bi) return ai - bi;
      return a.next_due_date.localeCompare(b.next_due_date);
    });
  }, [reminders]);

  const { page, totalPages, pageItems, total, from, to, goTo } =
    usePagination(sorted);

  const grouped = useMemo(() => {
    const map: Partial<Record<ReminderFrequency, Reminder[]>> = {};
    for (const r of pageItems) {
      (map[r.frequency] ??= []).push(r);
    }
    return map;
  }, [pageItems]);

  if (reminders.length === 0) {
    return (
      <p className="text-sm text-gray-text">
        No reminders yet. Add a daily, weekly, or monthly note above.
      </p>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="-mx-5 -mb-5 sm:-mx-6 sm:-mb-6">
      <div className="space-y-5 px-5 sm:px-6">
        {ORDER.map((freq) => {
          const items = grouped[freq];
          if (!items?.length) return null;
          return (
            <div key={freq}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-text">
                {freq}
              </h3>
              <div className="space-y-2">
                {items.map((reminder) => (
                  <ReminderRow
                    key={reminder.id}
                    reminder={reminder}
                    today={today}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <PaginationBar
          page={page}
          totalPages={totalPages}
          from={from}
          to={to}
          total={total}
          onPageChange={goTo}
        />
      </div>
    </div>
  );
}

function ReminderRow({
  reminder,
  today,
}: {
  reminder: Reminder;
  today: Date;
}) {
  const [toggleDone, { isLoading: toggleLoading }] =
    useToggleReminderDoneMutation();
  const [removeReminder, { isLoading: deleteLoading }] =
    useDeleteReminderMutation();
  const loading = toggleLoading || deleteLoading;
  const due = new Date(`${reminder.next_due_date}T00:00:00`);
  const overdue = !reminder.is_done && due < today;

  async function toggle() {
    try {
      await toggleDone({
        reminderId: reminder.id,
        isDone: !reminder.is_done,
      }).unwrap();
    } catch (err) {
      window.alert(rtkErrorMessage(err, "Failed to update reminder."));
    }
  }

  async function onDelete() {
    const ok = window.confirm(`Delete reminder "${reminder.title}"?`);
    if (!ok) return;
    try {
      await removeReminder(reminder.id).unwrap();
    } catch (err) {
      window.alert(rtkErrorMessage(err, "Failed to delete reminder."));
    }
  }

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        overdue
          ? "border-red/30 bg-red/5"
          : reminder.is_done
            ? "border-gray-soft bg-surface/80 opacity-70"
            : "border-gray-soft bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className={`font-medium text-ink ${reminder.is_done ? "line-through" : ""}`}
          >
            {reminder.title}
          </p>
          {reminder.body && (
            <p className="mt-1 text-sm text-gray-text">{reminder.body}</p>
          )}
          <p className="mt-1 text-xs text-gray-text">
            Due {formatDate(reminder.next_due_date)}
            {overdue ? " · Overdue" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={toggle}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-soft px-2.5 py-1 text-xs font-semibold text-ink hover:bg-gray-soft/60 disabled:opacity-60"
          >
            {toggleLoading && <InlineSpinner />}
            {reminder.is_done ? "Reopen" : "Mark done"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded-lg border border-red/30 bg-red/10 px-2.5 py-1 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-60"
          >
            {deleteLoading && <InlineSpinner />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
