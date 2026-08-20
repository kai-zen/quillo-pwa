export type PopoverPlacement = "top" | "bottom";

export const POPOVER_GAP = 6;

/** Nearest ancestor that can clip absolutely positioned children. */
export const getClippingParent = (el: HTMLElement): HTMLElement | null => {
  let parent = el.parentElement;

  while (parent && parent !== document.body) {
    const { overflow, overflowY } = getComputedStyle(parent);
    if (
      /(auto|scroll|hidden|clip)/.test(overflow) ||
      /(auto|scroll|hidden|clip)/.test(overflowY)
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null;
};

/** Prefer below; flip above when there isn't enough room and the top side has more space. */
export const resolvePopoverPlacement = (
  trigger: HTMLElement,
  popover: HTMLElement,
  gap = POPOVER_GAP,
): PopoverPlacement => {
  const triggerRect = trigger.getBoundingClientRect();
  const clipParent = getClippingParent(trigger);
  const clipRect = clipParent?.getBoundingClientRect();
  const boundsTop = clipRect?.top ?? 0;
  const boundsBottom = clipRect?.bottom ?? window.innerHeight;

  const spaceBelow = boundsBottom - triggerRect.bottom;
  const spaceAbove = triggerRect.top - boundsTop;
  const needed = popover.offsetHeight + gap;

  return spaceBelow < needed && spaceAbove > spaceBelow ? "top" : "bottom";
};
