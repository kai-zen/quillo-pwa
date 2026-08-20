"use client";

import { FC, useEffect, useMemo, useRef } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { cn } from "@/components/common";
import {
  DAY_STRIP_PAST,
  buildDayStrip,
  formatDayChipDay,
  formatDayChipWeekday,
  todayIso,
} from "./helpers";
import "swiper/css";

interface Props {
  centerDate: string;
  selectedDate: string;
  onSelect: (iso: string) => void;
}

const DayStrip: FC<Props> = ({ centerDate, selectedDate, onSelect }) => {
  const today = todayIso();
  const days = useMemo(() => buildDayStrip(centerDate), [centerDate]);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const selectedIndex = days.indexOf(selectedDate);
  const initialSlide =
    selectedIndex >= 0
      ? selectedIndex
      : Math.min(DAY_STRIP_PAST, days.length - 1);

  useEffect(() => {
    if (!swiperRef.current || selectedIndex < 0) return;
    swiperRef.current.slideTo(selectedIndex, 280);
  }, [selectedIndex, centerDate]);

  return (
    <Swiper
      key={centerDate}
      modules={[FreeMode, Mousewheel]}
      slidesPerView="auto"
      spaceBetween={6}
      centeredSlides
      centeredSlidesBounds
      slideToClickedSlide
      initialSlide={initialSlide}
      freeMode={{
        enabled: true,
        sticky: true,
        momentumRatio: 0.25,
        momentumVelocityRatio: 0.4,
      }}
      mousewheel={{
        forceToAxis: true,
        sensitivity: 0.8,
      }}
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      className="day-strip overflow-hidden px-1"
      role="listbox"
      aria-label="Select day"
    >
      {days.map((iso) => {
        const isSelected = iso === selectedDate;
        const isToday = iso === today;

        return (
          <SwiperSlide key={iso} className="w-auto!">
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-current={isToday ? "date" : undefined}
              onClick={() => onSelect(iso)}
              className={cn(
                "my-1 flex w-14 cursor-pointer flex-col items-center gap-1 rounded-xl border px-1.5 py-2 text-center transition-colors",
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : isToday
                    ? "border-foreground/40 bg-accent-soft text-foreground hover:border-foreground/60"
                    : "border-transparent text-muted hover:border-border hover:bg-accent-soft hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wide",
                  isSelected
                    ? "text-background/70"
                    : isToday
                      ? "text-foreground/70"
                      : "text-muted",
                )}
              >
                {formatDayChipWeekday(iso)}
              </span>
              <span
                className={cn(
                  "text-lg font-semibold tabular-nums leading-none",
                  isSelected
                    ? "text-background"
                    : isToday
                      ? "text-foreground"
                      : "text-foreground/55",
                )}
              >
                {formatDayChipDay(iso)}
              </span>
              <span
                className="flex h-1 items-center justify-center"
                aria-hidden
              >
                {isToday && !isSelected ? (
                  <span className="h-1 w-1 rounded-full bg-foreground" />
                ) : isSelected && isToday ? (
                  <span className="h-1 w-1 rounded-full bg-background/80" />
                ) : null}
              </span>
            </button>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default DayStrip;
