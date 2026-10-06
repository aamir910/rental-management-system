"use client";

import { deleteReminder, toggleReminderDone } from "@/app/admin/actions";
import type { Reminder, ReminderFrequency } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const ORDER: ReminderFrequency[] = ["daily", "weekly", "monthly"];

export function RemindersList({ reminders }: { reminders: Reminder[] }) {
  const grouped = useMemo(() => {
    const map: Record<ReminderFrequency, Reminder[]> = {
      daily: [],
      weekly: [],
      monthly: [],
    };
    for (const r of reminders) {
      map[r.frequency]?.push(r);
    }
    return map;
  }, [reminders]);

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
    <div className="space-y-5">
      {ORDER.map((freq) => {
        const items = grouped[freq];
        if (items.length === 0) return null;
        return (
          <div key={freq}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-text">
              {freq}
            </h3>
            <div className="space-y-2">
              {items.map((reminder) => (
                <ReminderRow key={reminder.id} reminder={reminder} today={today} />
              ))}
            </div>
          </div>
        );
      })}
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const due = new Date(`${reminder.next_due_date}T00:00:00`);
  const overdue = !reminder.is_done && due < today;

  async function toggle() {
    setLoading(true);
    const result = await toggleReminderDone(reminder.id, !reminder.is_done);
    setLoading(false);
    if (result?.error) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  }

  async function onDelete() {
    const ok = window.confirm(`Delete reminder "${reminder.title}"?`);
    if (!ok) return;
    setLoading(true);
    const result = await deleteReminder(reminder.id);
    setLoading(false);
    if (result?.error) {
      window.alert(result.error);
      return;
    }
    router.refresh();
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
            className="rounded-lg border border-gray-soft px-2.5 py-1 text-xs font-semibold text-ink hover:bg-gray-soft/60 disabled:opacity-60"
          >
            {reminder.is_done ? "Reopen" : "Mark done"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onDelete}
            className="rounded-lg border border-red/30 bg-red/10 px-2.5 py-1 text-xs font-semibold text-red hover:bg-red/20 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
