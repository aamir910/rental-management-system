"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, "all"] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

const STORAGE_KEY = "yasin-rms-page-size";
export const DEFAULT_PAGE_SIZE: PageSizeOption = 10;

function readStoredPageSize(): PageSizeOption {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "all") return "all";
    const n = Number(raw);
    if (n === 10 || n === 25 || n === 50) return n;
  } catch {
    // ignore
  }
  return DEFAULT_PAGE_SIZE;
}

export function usePagination<T>(items: T[]) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState<PageSizeOption>(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setPageSizeState(readStoredPageSize());
  }, []);

  const effectiveSize = pageSize === "all" ? Math.max(items.length, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(items.length / effectiveSize));

  useEffect(() => {
    setPage((current) => Math.min(Math.max(1, current), totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    if (pageSize === "all") return items;
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  function goTo(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages));
  }

  function setPageSize(next: PageSizeOption) {
    setPageSizeState(next);
    setPage(1);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore
    }
  }

  const from =
    items.length === 0
      ? 0
      : pageSize === "all"
        ? 1
        : (page - 1) * pageSize + 1;
  const to =
    pageSize === "all"
      ? items.length
      : Math.min(page * pageSize, items.length);

  return {
    page,
    totalPages,
    pageItems,
    total: items.length,
    from,
    to,
    pageSize,
    setPageSize,
    goTo,
  };
}

export function PaginationBar({
  page,
  totalPages,
  from,
  to,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  pageSize: PageSizeOption;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSizeOption) => void;
}) {
  if (total === 0) return null;

  const showPager = pageSize !== "all" && total > 10;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-soft px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-gray-text">
          Showing {from}–{to} of {total}
        </p>
        <label className="inline-flex items-center gap-1.5 text-xs text-gray-text">
          <span className="whitespace-nowrap">Per page</span>
          <select
            value={String(pageSize)}
            onChange={(e) => {
              const v = e.target.value;
              onPageSizeChange(v === "all" ? "all" : (Number(v) as 10 | 25 | 50));
            }}
            className="rounded-lg border border-gray-soft bg-white px-2 py-1 text-xs font-semibold text-ink outline-none ring-violet/30 focus:ring-2"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>

      {showPager && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-soft px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-gray-soft/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            Prev
          </button>
          <span className="min-w-[4.5rem] text-center text-xs font-medium text-ink">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-soft px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-gray-soft/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
