"use client";

import { useState } from "react";
import { buildCalendarDays, formatDateLabel, getMonthLabel, shiftMonth } from "@/lib/dates";
import { getAvailabilityStatus, getAvailabilityStatusLabel } from "@/lib/place-utils";
import type { Place } from "@/types/place";

interface AvailabilityCalendarProps {
  place: Place;
  selectedDate: string;
}

function getTone(status: ReturnType<typeof getAvailabilityStatus>) {
  switch (status) {
    case "open":
      return "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-500/18 dark:text-emerald-300";
    case "inquiry":
      return "bg-amber-500/12 text-amber-700 ring-amber-500/20 dark:bg-amber-500/18 dark:text-amber-300";
    case "booked":
      return "bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:bg-rose-500/18 dark:text-rose-300";
    default:
      return "bg-zinc-900/5 text-zinc-600 ring-zinc-900/10 dark:bg-white/5 dark:text-zinc-400";
  }
}

function getDotTone(status: ReturnType<typeof getAvailabilityStatus>) {
  switch (status) {
    case "open":
      return "bg-emerald-500";
    case "inquiry":
      return "bg-amber-500";
    case "booked":
      return "bg-rose-500";
    default:
      return "bg-zinc-300 dark:bg-zinc-600";
  }
}

export function AvailabilityCalendar({
  place,
  selectedDate,
}: AvailabilityCalendarProps) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const seed = selectedDate ? new Date(`${selectedDate}T00:00:00+09:00`) : new Date();
    return new Date(seed.getFullYear(), seed.getMonth(), 1);
  });

  const days = buildCalendarDays(monthCursor);

  return (
    <section className="rounded-[28px] border border-zinc-200/80 bg-white/90 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)] dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
            Availability
          </p>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {getMonthLabel(monthCursor)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthCursor((current) => shiftMonth(current, -1))}
            className="rounded-[8px] border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition hover:border-primary-400 hover:text-primary-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-primary-500 dark:hover:text-primary-300"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => setMonthCursor((current) => shiftMonth(current, 1))}
            className="rounded-[8px] border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition hover:border-primary-400 hover:text-primary-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-primary-500 dark:hover:text-primary-300"
          >
            다음
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-medium text-zinc-400">
        {["일", "월", "화", "수", "목", "금", "토"].map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square rounded-2xl border border-transparent"
              />
            );
          }

          const status = getAvailabilityStatus(place, day);
          const isSelected = day === selectedDate;

          return (
            <div
              key={day}
              className={`flex aspect-square flex-col justify-between rounded-2xl border p-1.5 ring-1 ring-inset sm:p-2 ${getTone(
                status
              )} ${isSelected ? "border-primary-500 shadow-[0_0_0_1px_rgba(100,197,218,0.4)]" : "border-transparent"}`}
            >
              <span className="text-xs font-semibold sm:text-sm">
                {Number(day.slice(-2))}
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${getDotTone(status)} sm:hidden`}
              />
              <span className="hidden text-[11px] leading-tight sm:block">
                {getAvailabilityStatusLabel(status)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-emerald-700 dark:text-emerald-300">
          예약 가능
        </span>
        <span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-amber-700 dark:text-amber-300">
          문의 필요
        </span>
        <span className="rounded-full bg-rose-500/12 px-2.5 py-1 text-rose-700 dark:text-rose-300">
          예약됨
        </span>
        <span className="rounded-full bg-zinc-900/5 px-2.5 py-1 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
          선택 날짜: {formatDateLabel(selectedDate)}
        </span>
      </div>
    </section>
  );
}
