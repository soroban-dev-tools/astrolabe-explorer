import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  renderHook,
} from "@testing-library/react";
import {
  ToastProvider,
  useToast,
  decodeContractError,
} from "@/components/toast";
import type { ReactNode } from "react";

describe("Toast Notification System", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("decodeContractError", () => {
    it("decodes known contract error codes", () => {
      expect(
        decodeContractError(new Error("HostError: Error(Contract, #1)")),
      ).toContain("Contract Error #1: Schema already exists");
      expect(
        decodeContractError(
          new Error("Invocation failed: Error(Contract, #3)"),
        ),
      ).toContain("Contract Error #3: Not authorized");
      expect(decodeContractError(new Error("Error(Contract, #4)"))).toContain(
        "Contract Error #4: Schema is irrevocable",
      );
      expect(decodeContractError(new Error("Error(Contract, #5)"))).toContain(
        "Contract Error #5: Attestation has already been revoked",
      );
    });

    it("decodes user rejection messages", () => {
      expect(decodeContractError(new Error("User rejected transaction"))).toBe(
        "Transaction was cancelled by the user",
      );
    });

    it("falls back to generic error message for unknown formats", () => {
      expect(decodeContractError(new Error("Network timeout"))).toBe(
        "Network timeout",
      );
      expect(decodeContractError(null)).toBe("An unknown error occurred");
    });
  });

  describe("ToastProvider and useToast hook", () => {
    it("throws error when useToast is used outside provider", () => {
      expect(() => renderHook(() => useToast())).toThrow(
        "useToast must be used within a ToastProvider",
      );
    });

    it("renders toasts and handles dismissal", () => {
      function TestComponent() {
        const toast = useToast();
        return (
          <div>
            <button
              onClick={() => toast.success("Attestation issued", "Success")}
            >
              Show Success
            </button>
            <button onClick={() => toast.error("Revocation failed", "Error")}>
              Show Error
            </button>
          </div>
        );
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByText("Show Success"));
      expect(screen.getByText("Attestation issued")).toBeDefined();
      expect(screen.getByText("Success")).toBeDefined();

      fireEvent.click(screen.getByText("Show Error"));
      expect(screen.getByText("Revocation failed")).toBeDefined();

      // Dismiss the first toast
      const dismissButtons = screen.getAllByRole("button", {
        name: "Dismiss notification",
      });
      fireEvent.click(dismissButtons[0]);
      expect(screen.queryByText("Attestation issued")).toBeNull();
      expect(screen.getByText("Revocation failed")).toBeDefined();

      // Fast forward auto-dismiss
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.queryByText("Revocation failed")).toBeNull();
    });
  });
});
