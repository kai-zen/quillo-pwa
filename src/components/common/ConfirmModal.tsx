"use client";

import { FC, ReactNode } from "react";
import Button from "./Button";
import Modal from "./Modal";

interface Props {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  pending?: boolean;
  pendingLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal: FC<Props> = ({
  open,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  pending = false,
  pendingLabel = "Working…",
  onClose,
  onConfirm,
}) => {
  const close = () => {
    if (pending) return;
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title={title} className="max-w-md">
      <div className="flex flex-col gap-3">
        {description ? (
          <p className="text-sm text-muted">{description}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={close} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
