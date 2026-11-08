// Copyright 2026 The Astrolabe Authors. Apache-2.0.

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import NotFound from "@/app/not-found";
import ErrorBoundary from "@/app/error";

describe("Error and Not Found pages", () => {
  it("renders 404 page with navigation action", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeDefined();
    expect(screen.getByText("Page Not Found")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Back to Schemas" }),
    ).toBeDefined();
  });

  it("renders error boundary with reset trigger and error text", () => {
    const reset = vi.fn();
    const testError = new Error("RPC network timeout");

    render(<ErrorBoundary error={testError} reset={reset} />);
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("RPC network timeout")).toBeDefined();

    const tryAgainBtn = screen.getByRole("button", { name: "Try Again" });
    fireEvent.click(tryAgainBtn);
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
