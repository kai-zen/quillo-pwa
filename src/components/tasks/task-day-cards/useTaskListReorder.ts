"use client";

import {
  KeyboardEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { RecordId } from "@/shared/types";

const EDGE_PX = 56;
const SCROLL_PX = 12;

const moveId = (ids: RecordId[], from: number, to: number): RecordId[] => {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= ids.length ||
    to >= ids.length
  ) {
    return ids;
  }
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const slotToIndex = (from: number, slot: number): number => {
  if (from < slot) return slot - 1;
  return slot;
};

interface DragState {
  activeId: RecordId;
  fromIndex: number;
  slot: number;
  pointerId: number;
}

interface Options {
  ids: RecordId[];
  enabled?: boolean;
  onReorder?: (ids: RecordId[]) => void;
}

export function useTaskListReorder({
  ids,
  enabled = true,
  onReorder,
}: Options) {
  const listRef = useRef<HTMLUListElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const dragYRef = useRef(0);
  const [drag, setDrag] = useState<DragState | null>(null);

  const measureSlot = useCallback((clientY: number) => {
    const root = listRef.current;
    if (!root) return 0;
    const items = [...root.querySelectorAll<HTMLElement>("[data-task-id]")];
    for (let i = 0; i < items.length; i += 1) {
      const rect = items[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return items.length;
  }, []);

  const finish = useCallback(() => {
    const state = dragRef.current;
    if (!state) return;
    dragRef.current = null;
    setDrag(null);

    const from = ids.indexOf(state.activeId);
    const next = moveId(ids, from, slotToIndex(from, state.slot));
    if (next.some((id, index) => id !== ids[index]) && onReorder)
      onReorder(next);
  }, [ids, onReorder]);

  const onPointerDown = useCallback(
    (id: RecordId) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!enabled || event.button !== 0) return;
      const fromIndex = ids.indexOf(id);
      if (fromIndex < 0 || ids.length < 2) return;

      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragYRef.current = event.clientY;

      const next: DragState = {
        activeId: id,
        fromIndex,
        slot: fromIndex,
        pointerId: event.pointerId,
      };
      dragRef.current = next;
      setDrag(next);
    },
    [enabled, ids],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const state = dragRef.current;
      if (!state || event.pointerId !== state.pointerId) return;
      dragYRef.current = event.clientY;
    },
    [],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const state = dragRef.current;
      if (!state || event.pointerId !== state.pointerId) return;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      finish();
    },
    [finish],
  );

  const isDragging = drag !== null;

  useEffect(() => {
    if (!isDragging) return;

    let frame = 0;
    const tick = () => {
      const y = dragYRef.current;
      if (y < EDGE_PX) window.scrollBy(0, -SCROLL_PX);
      else if (y > window.innerHeight - EDGE_PX) window.scrollBy(0, SCROLL_PX);

      const current = dragRef.current;
      if (current) {
        const slot = measureSlot(y);
        if (slot !== current.slot) {
          const next = { ...current, slot };
          dragRef.current = next;
          setDrag(next);
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isDragging, measureSlot]);

  const onKeyDown = useCallback(
    (id: RecordId) => (event: KeyboardEvent<HTMLButtonElement>) => {
      if (!enabled) return;
      const from = ids.indexOf(id);
      if (from < 0) return;

      let to = from;
      if (event.key === "ArrowUp") to = from - 1;
      else if (event.key === "ArrowDown") to = from + 1;
      else return;

      event.preventDefault();
      event.stopPropagation();
      const next = moveId(ids, from, to);
      if (next.some((item, index) => item !== ids[index]) && onReorder)
        onReorder(next);
    },
    [enabled, ids, onReorder],
  );

  const bindHandle = useCallback(
    (id: RecordId) => ({
      onPointerDown: onPointerDown(id),
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onKeyDown: onKeyDown(id),
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
      },
    }),
    [onKeyDown, onPointerDown, onPointerMove, onPointerUp],
  );

  const fromIndex = drag?.fromIndex ?? -1;
  const noopSlot =
    drag != null && (drag.slot === fromIndex || drag.slot === fromIndex + 1);

  return {
    listRef,
    activeId: drag?.activeId ?? null,
    dropSlot: drag && !noopSlot ? drag.slot : null,
    bindHandle,
  };
}
