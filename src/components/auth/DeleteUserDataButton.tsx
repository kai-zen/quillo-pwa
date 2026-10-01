"use client";

import { Check, Trash2 } from "lucide-react";
import { FC, useState } from "react";
import { Button, IconButton, Modal, cn } from "@/components/common";
import { getErrorMessage } from "@/shared/errors";
import { useUsersApi } from "@/shared/hooks";
import {
  USER_DATA_DELETE_TYPES,
  type DeleteUserDataBody,
  type DeleteUserDataResponse,
  type UserDataDeleteType,
} from "@/shared/types";

const DATA_TYPE_OPTIONS: {
  value: UserDataDeleteType;
  label: string;
  description: string;
}[] = [
  {
    value: "daily_tasks",
    label: "Daily tasks",
    description: "Tasks scheduled on a day",
  },
  {
    value: "daily_sections",
    label: "Daily sections",
    description: "Sections of a day",
  },
  {
    value: "daily_notes",
    label: "Daily notes",
    description: "Notes tied to a date",
  },
  {
    value: "progress_inputs",
    label: "Progress inputs",
    description: "Recorded progress values",
  },
  {
    value: "daily_reviews",
    label: "Daily reviews",
    description: "End-of-day reviews",
  },
];

const DATA_TYPE_LABELS: Record<UserDataDeleteType, string> = {
  daily_tasks: "Daily tasks",
  daily_notes: "Daily notes",
  progress_inputs: "Progress inputs",
  daily_reviews: "Daily reviews",
  daily_sections: "Daily sections",
};

const formatDeleted = (deleted: DeleteUserDataResponse["deleted"]): string => {
  const parts = USER_DATA_DELETE_TYPES.flatMap((type) => {
    const count = deleted[type] ?? 0;
    if (count <= 0) return [];
    return [`${count} ${DATA_TYPE_LABELS[type].toLowerCase()}`];
  });

  if (parts.length === 0) return "No matching records to delete.";
  if (parts.length === 1) return `Deleted ${parts[0]}.`;
  const last = parts.at(-1);
  return `Deleted ${parts.slice(0, -1).join(", ")} and ${last}.`;
};

const DeleteUserDataButton: FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton label="Delete data" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" aria-hidden />
      </IconButton>
      <DeleteUserDataModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

const DeleteUserDataModal: FC<ModalProps> = ({ open, onClose }) => {
  const { deleteMyData, isDeletingData } = useUsersApi();

  const close = () => {
    if (isDeletingData) return;
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Delete data"
      overlayClassName="z-90"
      className="max-w-md"
    >
      {open && (
        <DeleteUserDataBody
          deleteMyData={deleteMyData}
          isDeletingData={isDeletingData}
          onClose={close}
        />
      )}
    </Modal>
  );
};

interface BodyProps {
  deleteMyData: (body: DeleteUserDataBody) => Promise<DeleteUserDataResponse>;
  isDeletingData: boolean;
  onClose: () => void;
}

const DeleteUserDataBody: FC<BodyProps> = ({
  deleteMyData,
  isDeletingData,
  onClose,
}) => {
  const [selected, setSelected] = useState<UserDataDeleteType[]>([]);
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState<
    DeleteUserDataResponse["deleted"] | null
  >(null);

  const toggle = (type: UserDataDeleteType) => {
    setSelected((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  };

  const onDelete = async () => {
    if (selected.length === 0 || isDeletingData) return;
    setError("");

    try {
      const result = await deleteMyData({ types: selected });
      setDeleted(result.deleted);
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete data."));
    }
  };

  if (deleted) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">{formatDeleted(deleted)}</p>
        <div className="flex justify-end pt-1">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Remove selected daily records. Your account and everything else stays.
      </p>

      <ul className="overflow-hidden rounded-xl border border-border">
        {DATA_TYPE_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.value);

          return (
            <li
              key={option.value}
              className="border-b border-border last:border-b-0"
            >
              <button
                type="button"
                onClick={() => toggle(option.value)}
                disabled={isDeletingData}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 px-3 py-2.5 text-left transition-colors",
                  "hover:bg-accent-soft focus-visible:bg-accent-soft focus-visible:outline-none",
                  isSelected && "bg-accent-soft/70",
                  isDeletingData && "cursor-not-allowed opacity-50",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-surface text-transparent",
                  )}
                  aria-hidden
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {option.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {error ? <p className="text-sm text-rose-500">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onClose} disabled={isDeletingData}>
          Cancel
        </Button>
        <Button
          onClick={() => void onDelete()}
          disabled={isDeletingData || selected.length === 0}
        >
          {isDeletingData ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </div>
  );
};

export default DeleteUserDataButton;
