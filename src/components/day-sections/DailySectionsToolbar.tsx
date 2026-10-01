"use client";

import { LayoutTemplate, Plus } from "lucide-react";
import { FC } from "react";
import { Button } from "@/components/common";

interface Props {
  pending: boolean;
  onAddSection: () => void;
  onApplyTemplate: () => void;
}

const DailySectionsToolbar: FC<Props> = ({
  pending,
  onAddSection,
  onApplyTemplate,
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <Button
      variant="secondary"
      size="sm"
      onClick={onAddSection}
      disabled={pending}
      startIcon={<Plus className="h-3.5 w-3.5" aria-hidden />}
    >
      Add section
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={onApplyTemplate}
      disabled={pending}
      startIcon={<LayoutTemplate className="h-3.5 w-3.5" aria-hidden />}
    >
      Apply template
    </Button>
  </div>
);

export default DailySectionsToolbar;
