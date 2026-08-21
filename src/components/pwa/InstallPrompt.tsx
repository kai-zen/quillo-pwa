"use client";

import { Download, X } from "lucide-react";
import { FC, useEffect, useState } from "react";
import Button from "@/components/common/Button";

const DISMISS_KEY = "quillo_install_dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPrompt: FC = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!visible || !deferred) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setDeferred(null);
  };

  const install = async () => {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setDeferred(null);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-20 flex justify-center px-4 md:bottom-6">
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 shadow-sm">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Install Quillo</p>
          <p className="text-xs text-muted">Add it to your home screen for quick access.</p>
        </div>
        <Button
          size="sm"
          onClick={install}
          startIcon={<Download className="h-3.5 w-3.5" aria-hidden />}
        >
          Install
        </Button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-accent-soft hover:text-foreground"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
