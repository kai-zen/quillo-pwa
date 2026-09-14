import {
  Button,
  cn,
  DatePickerIconButton,
  IconButton,
} from "@/components/common";
import { FC } from "react";
import { formatDayShort } from "../helpers";
import { Plus, StickyNote } from "lucide-react";

interface Props {
  selectedDate: string;
  jumpToDate: (iso: string) => void;
  showNotes: boolean;
  toggleNotes: () => void;
  addHandler: () => void;
}

const DailyActionsBar: FC<Props> = ({
  selectedDate,
  jumpToDate,
  showNotes,
  toggleNotes,
  addHandler,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <DatePickerIconButton
            value={selectedDate}
            onChange={jumpToDate}
            label="Pick a date"
          />
          <p className="text-sm font-medium tabular-nums">
            {formatDayShort(selectedDate)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <IconButton
            label="Day notes"
            active={showNotes}
            aria-pressed={showNotes}
            onClick={toggleNotes}
          >
            <StickyNote
              className={cn(
                "h-5 w-5 origin-top transition-transform duration-200 ease-out",
                showNotes ? "" : "rotate-14 translate-y-px translate-x-[2px]",
              )}
              aria-hidden
            />
          </IconButton>
          <Button
            onClick={addHandler}
            size="sm"
            className="w-[100px]"
            variant={showNotes ? "secondary" : "primary"}
            startIcon={<Plus className="h-4 w-4" aria-hidden />}
          >
            {showNotes ? "Add note" : "Add task"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyActionsBar;
