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
  selectedDate: string;
  onSelect: (iso: string) => void;
}

const DayStrip: FC<Props> = ({ selectedDate, onSelect }) => {
  const today = todayIso();
  const days = useMemo(() => buildDayStrip(today), [today]);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const selectedIndex = days.indexOf(selectedDate);

  useEffect(() => {
    if (!swiperRef.current || selectedIndex < 0) return;
    swiperRef.current.slideTo(selectedIndex, 280);
  }, [selectedIndex]);

  return (
    <Swiper
      modules={[FreeMode, Mousewheel]}
      slidesPerView="auto"
      spaceBetween={6}
      centeredSlides
      centeredSlidesBounds
      slideToClickedSlide
      initialSlide={DAY_STRIP_PAST}
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
              onClick={() => onSelect(iso)}
              className={cn(
                "flex w-14 flex-col items-center gap-0.5 rounded-xl px-1.5 my-1 py-2 text-center transition-colors cursor-pointer border border-border",
                isSelected
                  ? "bg-accent-soft text-foreground"
                  : "text-muted hover:bg-background hover:text-foreground",
                isToday && !isSelected && "ring-1 ring-border/70",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                {formatDayChipWeekday(iso)}
              </span>
              <span
                className={cn(
                  "text-lg font-semibold tabular-nums leading-none",
                  isSelected ? "text-foreground" : "text-foreground/90",
                )}
              >
                {formatDayChipDay(iso)}
              </span>
            </button>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default DayStrip;
