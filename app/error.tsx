"use client";
// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { useEffect } from "react";
import { Button, Card } from "@/components/ui";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Retain runtime error boundary diagnostics
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <Card className="space-y-4 border-red-500/40">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-red-400">
            Something went wrong
          </h1>
          <p className="text-sm text-muted">
            An unexpected error occurred while communicating with the network.
          </p>
          {error.message && (
            <div className="break-all rounded bg-surface/80 p-2 font-mono text-xs text-muted">
              {error.message}
            </div>
          )}
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Go Home
          </Button>
          <Button onClick={() => reset()}>Try Again</Button>
        </div>
      </Card>
    </div>
  );
}
