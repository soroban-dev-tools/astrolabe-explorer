"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Map common Soroban / Astrolabe contract error numbers to readable messages. */
export function decodeContractError(err: unknown): string {
  if (!err) return "An unknown error occurred";
  const msg = err instanceof Error ? err.message : String(err);

  // Match contract error codes like Error(Contract, #1) or code: 1
  const match =
    msg.match(/Error\(Contract,\s*#?(\d+)\)/i) || msg.match(/code:\s*(\d+)/i);
  if (match) {
    const code = Number(match[1]);
    switch (code) {
      case 1:
        return "Contract Error #1: Schema already exists or duplicate UID";
      case 2:
        return "Contract Error #2: Schema not found";
      case 3:
        return "Contract Error #3: Not authorized to perform this operation";
      case 4:
        return "Contract Error #4: Schema is irrevocable and cannot be revoked";
      case 5:
        return "Contract Error #5: Attestation has already been revoked";
      case 6:
        return "Contract Error #6: Attestation not found for UID";
      case 7:
        return "Contract Error #7: Attestation has expired";
      case 8:
        return "Contract Error #8: Schema definition exceeds maximum length";
      case 9:
        return "Contract Error #9: Data payload encoding is invalid";
      default:
        return `Contract Error #${code}: Transaction failed`;
    }
  }

  // Handle common RPC/Wallet errors
  if (msg.includes("User rejected") || msg.includes("User declined")) {
    return "Transaction was cancelled by the user";
  }
  if (msg.includes("txBadSeq")) {
    return "Transaction sequence mismatch; please try again";
  }
  if (msg.includes("insufficient balance")) {
    return "Insufficient balance for transaction fee";
  }

  return msg;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type, title }]);
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, title?: string) => addToast(message, "success", title),
    [addToast],
  );
  const error = useCallback(
    (message: string, title?: string) => addToast(message, "error", title),
    [addToast],
  );
  const info = useCallback(
    (message: string, title?: string) => addToast(message, "info", title),
    [addToast],
  );

  const value = useMemo(
    () => ({ toasts, addToast, removeToast, success, error, info }),
    [toasts, addToast, removeToast, success, error, info],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function Toaster() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const borderTone = {
          success: "border-green-500/40 bg-surface text-green-300",
          error: "border-red-500/40 bg-surface text-red-300",
          info: "border-accent/40 bg-surface text-fg",
        }[toast.type];

        return (
          <div
            key={toast.id}
            role="alert"
            className={`flex items-start justify-between gap-3 rounded-lg border p-3 shadow-lg ${borderTone}`}
          >
            <div className="space-y-0.5">
              {toast.title && (
                <div className="font-semibold text-xs tracking-wide uppercase">
                  {toast.title}
                </div>
              )}
              <div className="text-sm text-fg break-words">{toast.message}</div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-muted hover:text-fg text-xs font-mono px-1"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
