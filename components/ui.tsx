// Copyright 2026 The Astrolabe Authors. Apache-2.0.
// Small styling primitives. Not a full design system; enough to be tidy.

import { type ReactNode, type ButtonHTMLAttributes } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const styles = {
    primary: "bg-accent text-white hover:opacity-90",
    ghost: "border border-border bg-transparent hover:bg-surface",
    danger: "border border-red-500 text-red-500 hover:bg-red-500/10",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "green" | "red";
}) {
  const styles = {
    muted: "bg-border text-muted",
    green: "bg-green-500/15 text-green-400",
    red: "bg-red-500/15 text-red-400",
  }[tone];
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles}`}>
      {children}
    </span>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return (
    <code className="break-all font-mono text-xs text-muted">{children}</code>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-md border border-border bg-bg px-3 py-1.5 text-sm outline-none focus:border-accent"
      {...props}
    />
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted">
      {children}
    </div>
  );
}

export function shorten(s: string, head = 6, tail = 6): string {
  return s.length > head + tail ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
}
