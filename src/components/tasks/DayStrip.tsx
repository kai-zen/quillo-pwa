"use client";

import { FC, useEffect, useMemo, useRef } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useDailyReviewsApi } from "@/shared/hooks";
import type { DailyReviewMood } from "@/shared/types";
import { DAY_STRIP_PAST, buildDayStrip, todayIso } from "./helpers";
import DayStripDayCell from "./DayStripDayCell";
import "swiper/css";

interface Props {
  centerDate: string;
  selectedDate: string;
  onSelect: (iso: string) => void;
}

const DayStrip: FC<Props> = ({ centerDate, selectedDate, onSelect }) => {
  const today = todayIso();
  const days = useMemo(() => buildDayStrip(centerDate), [centerDate]);
  const rangeQuery = useMemo(
    () => ({ from: days[0]!, to: days[days.length - 1]! }),
    [days],
  );
  const { useDailyReviewsRange } = useDailyReviewsApi();
  const reviewsQuery = useDailyReviewsRange(rangeQuery);

  const moodByDate = useMemo(() => {
    const map = new Map<string, DailyReviewMood>();
    for (const review of reviewsQuery.data?.items ?? []) {
      map.set(review.date.slice(0, 10), review.mood);
    }
    return map;
  }, [reviewsQuery.data]);

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
      spaceBetween={10}
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
        return (
          <SwiperSlide key={iso} className="w-auto!">
            <DayStripDayCell
              iso={iso}
              mood={moodByDate.get(iso)}
              isSelected={iso === selectedDate}
              isToday={iso === today}
              onSelect={onSelect}
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default DayStrip;
